import { tool } from "@opencode-ai/plugin";
import { Database } from "bun:sqlite";
import { pipeline } from "@xenova/transformers";
import { z } from "zod";
import path from "path";

// Load Homebrew SQLite on macOS for better performance and features
Database.setCustomSQLite("/opt/homebrew/opt/sqlite3/lib/libsqlite3.dylib");

// Default embedding model - using Xenova/all-MiniLM-L6-v2 (384 dimensions)
const DEFAULT_MODEL = "Xenova/all-MiniLM-L6-v2";
const EMBEDDING_DIMENSION = 384;

let dbPath = `${process.env.HOME || "."}/.config/opencode/vector-db.sqlite`;
let embeddingPipeline: any = null;

/**
 * Set the database file path for the vector store.
 * @param pathStr - The path to the SQLite database file
 */
export function setDatabasePath(pathStr: string): void {
  dbPath = pathStr;
}

/**
 * Get or initialize the embedding pipeline (singleton pattern for caching).
 * @returns The embedding pipeline
 */
async function getEmbeddingPipeline() {
  if (!embeddingPipeline) {
    embeddingPipeline = await pipeline("feature-extraction", DEFAULT_MODEL);
  }
  return embeddingPipeline;
}

/**
 * Generate an embedding vector from text.
 * @param text - The text to embed
 * @returns Float32Array of embedding values
 */
async function generateEmbedding(text: string): Promise<Float32Array> {
  const extractor = await getEmbeddingPipeline();
  const result = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });
  return result.data;
}

/**
 * Get or create the vector database connection with extension loaded.
 * @returns Database connection with vec0 extension loaded
 */
function getDb(): Database {
  const db = new Database(dbPath, { create: true });
  
  try {
    db.loadExtension("./lib/vec0");
  } catch (e) {
    throw new Error(`Failed to load vec0 extension: ${e instanceof Error ? e.message : String(e)}`);
  }
  
  // Create the vector_store table if it doesn't exist
  db.run(`CREATE TABLE IF NOT EXISTS vector_store (
    key TEXT PRIMARY KEY,
    value TEXT,
    embedding VECTOR(${EMBEDDING_DIMENSION})
  )`);
  
  return db;
}

/**
 * Store a key-value pair with automatically generated embedding.
 * @param key - The key to store
 * @param value - The value to store
 * @returns Confirmation message or error
 */
/**
 * Import a file by reading its contents and storing a vector.
 * The key will be the file contents, and the value will be the file path.
 * @param filepath - The path to the file to import
 * @returns Confirmation message or error
 */
export async function import_file(filepath?: string): Promise<string> {
  const fs = require('fs');
  if (!filepath || typeof filepath !== "string" || filepath.trim() === "") {
    return "Error: Filepath is required for import_file action.";
  }
  try {
    if (!fs.existsSync(filepath)) {
      return `Error: File not found at path: ${filepath}`;
    }
    const stat = fs.statSync(filepath);
    if (!stat.isFile()) {
      return `Error: Path is not a file: ${filepath}`;
    }
    let contents = fs.readFileSync(filepath, "utf8");
    if (typeof contents !== "string" || contents.length === 0) {
      return `Error: File is empty or could not be read: ${filepath}`;
    }
    // Optionally, truncate very large files for embedding
    const MAX_LENGTH = 10000;
    if (contents.length > MAX_LENGTH) {
      contents = contents.slice(0, MAX_LENGTH);
    }
    return await store(contents, filepath);
  } catch (e) {
    return `Error importing file: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export async function store(key: string, value: string): Promise<string> {

  try {
    const db = getDb();
    
    // Generate embedding for the key
    const embedding = await generateEmbedding(key);
    const embeddingArray = Array.from(embedding);
    const embeddingJson = JSON.stringify(embeddingArray);
    
    // Convert to vec_f32 format for sqlite-vec
    db.query(
      `INSERT INTO vector_store (key, value, embedding) 
       VALUES (?1, ?2, vec_f32(?3))
       ON CONFLICT(key) DO UPDATE SET value=excluded.value, embedding=excluded.embedding`
    ).run(key, value, embeddingJson);
    
    return `Key "${key}" stored successfully with embedding.`;
  } catch (e) {
    return `Error storing key: ${e instanceof Error ? e.message : String(e)}`;
  }
}

/**
 * Retrieve the value for a given key (exact match).
 * @param key - The key to retrieve
 * @returns The value or empty string if not found
 */
export function retrieve(key: string): string {
  try {
    const db = getDb();
    const row = db.query(`SELECT value FROM vector_store WHERE key = ?1`).get(key);
    
    if (!row || typeof row !== 'object' || row === null) return "";
    
    const value = (row as Record<string, any>)["value"];
    if (typeof value !== "string") return "";
    
    return value;
  } catch (e) {
    return "";
  }
}

/**
 * Delete a key-value pair by key.
 * @param key - The key to delete
 * @returns The deleted key or empty string if not found
 */
export function del(key: string): string {
  try {
    const db = getDb();
    const row = db.query(`SELECT key FROM vector_store WHERE key = ?1`).get(key);
    
    if (!row || typeof row !== 'object' || row === null) return "";
    
    db.query(`DELETE FROM vector_store WHERE key = ?1`).run(key);
    
    return key;
  } catch (e) {
    return "";
  }
}

/**
 * List all keys with optional pagination.
 * @param limit - Maximum number of keys to return (default: 50)
 * @param offset - Offset for pagination (default: 0)
 * @returns JSON array of keys
 */
export function list(limit: number = 50, offset: number = 0): string {
  try {
    const db = getDb();
    const rows = db.query(
      `SELECT key FROM vector_store LIMIT ?1 OFFSET ?2`
    ).all(limit, offset);
    
    if (!rows.length) return "[]";
    
    return JSON.stringify(rows.map((r: any) => r.key));
  } catch (e) {
    return "[]";
  }
}

/**
 * Similarity search for the most similar keys/values to a query string.
 * @param query - The search string to embed and compare
 * @param topK - Number of results to return (default: 5)
 * @returns JSON array of objects with key, value, and score
 */
export async function search(query: string, topK: number = 5): Promise<string> {
  try {
    const db = getDb();
    
    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);
    const embeddingArray = Array.from(queryEmbedding);
    const embeddingJson = JSON.stringify(embeddingArray);
    
    // Perform similarity search using cosine distance
    const rows = db.query(
      `SELECT
        key,
        value,
        vec_distance_cosine(embedding, vec_f32(?1)) AS score
      FROM vector_store
      ORDER BY score ASC
      LIMIT ?2`
    ).all(embeddingJson, topK);
    
    if (!rows.length) return "[]";
    
    return JSON.stringify(rows);
  } catch (e) {
    return `Error during search: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export default tool({
  description: "A persistent, SQLite-backed vector store for RAG and semantic search. Stores key-value pairs with embeddings (384-dim using Xenova/all-MiniLM-L6-v2) and supports similarity search using sqlite-vec extension.",
  args: {
    action: z.enum(["store", "retrieve", "delete", "list", "search", "set_database", "import_file"]).describe("Action to perform: store, retrieve, delete, list, search, set_database, or import_file"),
    key: z.string().optional().describe("The key to store, retrieve, or delete"),
    value: z.string().optional().describe("The value to store with the key"),
    filepath: z.string().optional().describe("Path to the file to import as a vector (for import_file action)"),
    query: z.string().optional().describe("Search query string for similarity search"),
    topK: z.number().optional().describe("Number of results to return for search (default: 5)"),
    limit: z.number().optional().describe("Maximum number of keys to return for list (default: 50)"),
    offset: z.number().optional().describe("Offset for pagination in list (default: 0)"),
    filename: z.string().optional().describe("Path to the SQLite database file"),
  },
  async execute(args, context) {
    const { action, key, value, query, topK, limit, offset, filename } = args;
    
    switch (action) {
      case "store":
        if (!key || typeof value !== "string") {
          return "Error: Both key and value are required for store action.";
        }
        return await store(key, value);
        
      case "retrieve":
        if (!key) {
          return "Error: Key is required for retrieve action.";
        }
        return retrieve(key);
        
      case "delete":
        if (!key) {
          return "Error: Key is required for delete action.";
        }
        return del(key);
        
      case "list":
        return list(limit, offset);
        
      case "search":
        if (!query) {
          return "Error: Query is required for search action.";
        }
        return await search(query, topK);
        
      case "set_database": {
        const fs = require('fs');
        let resolvedPath = '';
        const defaultName = 'vector-db.sqlite';
        const homeConfig = `${process.env.HOME || "."}/.config/opencode/`;
        
        if (!filename || typeof filename !== 'string' || filename.trim() === "") {
          resolvedPath = path.join(homeConfig, defaultName);
        } else {
          try {
            const stat = fs.statSync(filename);
            if (stat.isDirectory()) {
              resolvedPath = path.join(filename, defaultName);
            } else {
              resolvedPath = filename;
            }
          } catch {
            // If filename ends with a path separator, treat as directory
            if (filename.endsWith(path.sep)) {
              resolvedPath = path.join(filename, defaultName);
            } else {
              resolvedPath = filename;
            }
          }
        }
        
        setDatabasePath(resolvedPath);
        return `Database path set to: ${resolvedPath}`;
      }
      
      case "import_file": {
        return await import_file(args.filepath);
      }
      default:
        return "Error: Unknown action. Use store, retrieve, delete, list, search, set_database, or import_file.";
    }
  },
});
