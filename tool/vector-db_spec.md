# vector-db Tool Specification

## Overview

`vector-db` is a persistent, SQLite-backed vector store for retrieval-augmented generation (RAG) and semantic search. It is similar in interface to the `key-value-store` tool, but stores a key, value, and an embedding vector (using Xenova/all-MiniLM-L6-v2, 384-dim) for each entry. It supports similarity search using the sqlite-vec extension and generates embeddings via @xenova/transformers.

## Functional Goals

- Store a key, value, and embedding vector (Xenova/all-MiniLM-L6-v2, 384-dim) in SQLite.
- On store, automatically generate the embedding vector from the key using @xenova/transformers.
- Retrieve value by key (exact match).
- Delete by key.
- List all keys (optionally with pagination or limit).
- Similarity search: Given a string, embed it and return the N most similar items (configurable N, default 5), sorted by cosine similarity (lower = more similar).
- Allow setting the database file path.

## Non-Functional Goals

- Use the sqlite-vec extension for vector storage and similarity search.
- Use @xenova/transformers for embedding generation (Xenova/all-MiniLM-L6-v2 model).
- Provide clear, human-readable output.
- Follow opencode custom tool and code standards (Zod validation, tool() helper, etc.).
- Be robust to errors (e.g., missing extension, invalid input).
- Document all arguments and actions.
- Work in Bun runtime without GPU requirements.
- Support fully offline operation after initial model download.

## Actions and Arguments

### store
- **Description:** Store a key-value pair, automatically embedding the key.
- **Arguments:**
  - `key` (string, required): The key to store.
  - `value` (string, required): The value to store.
- **Returns:** Confirmation message or error.

### retrieve
- **Description:** Retrieve the value for a given key (exact match).
- **Arguments:**
  - `key` (string, required): The key to retrieve.
- **Returns:** The value or a not-found message.

### delete
- **Description:** Delete a key-value pair by key.
- **Arguments:**
  - `key` (string, required): The key to delete.
- **Returns:** Confirmation message or warning if not found.

### list
- **Description:** List all keys (optionally paginated).
- **Arguments:**
  - `limit` (number, optional): Max number of keys to return (default: 50).
  - `offset` (number, optional): Offset for pagination (default: 0).
- **Returns:** Array of keys.

### search
- **Description:** Similarity search for the most similar keys/values to a query string.
- **Arguments:**
  - `query` (string, required): The search string to embed and compare.
  - `topK` (number, optional): Number of results to return (default: 5).
- **Returns:** Array of objects: `{ key, value, score }` sorted by similarity (lower score = more similar).

### set_database
- **Description:** Set the database file path.
- **Arguments:**
  - `filename` (string, required): Path to the SQLite database file.
- **Returns:** Confirmation message.

## SQLite Engine and Extension Loading

- The tool must set the custom SQLite3 engine path for maximum extension compatibility (e.g., Homebrew SQLite on macOS, as in `key-value-store.ts`).
- The tool must load the `vec0` (sqlite-vec) extension before any table creation or vector operations.
- If the engine or extension is missing or fails to load, the tool must return a clear, human-readable error and not proceed with vector operations.
- These steps are required for all actions that interact with the database.

## SQLite Schema

```
CREATE TABLE IF NOT EXISTS vector_store (
  key TEXT PRIMARY KEY,
  value TEXT,
  embedding VECTOR(384)
);
```

Note: HNSW indexing is not used in the current implementation as it caused compatibility issues.

## Embedding and Similarity Search Implementation

### Embedding Generation
- Embeddings are generated using @xenova/transformers with the Xenova/all-MiniLM-L6-v2 model
- The embedding pipeline is cached as a singleton for performance
- Embeddings are 384-dimensional Float32Arrays

### Insert with Embedding
Generate an embedding for a key and insert it with its value:

```typescript
// Generate embedding
const embedding = await generateEmbedding(key);
const embeddingArray = Array.from(embedding);
const embeddingJson = JSON.stringify(embeddingArray);

// Insert into database
db.query(
  `INSERT INTO vector_store (key, value, embedding) 
   VALUES (?1, ?2, vec_f32(?3))
   ON CONFLICT(key) DO UPDATE SET value=excluded.value, embedding=excluded.embedding`
).run(key, value, embeddingJson);
```

### Similarity Search
Find the top K most similar entries to a query string (lower score = more similar):

```typescript
// Generate query embedding
const queryEmbedding = await generateEmbedding(query);
const embeddingJson = JSON.stringify(Array.from(queryEmbedding));

// Perform similarity search
const rows = db.query(
  `SELECT
    key,
    value,
    vec_distance_cosine(embedding, vec_f32(?1)) AS score
  FROM vector_store
  ORDER BY score ASC
  LIMIT ?2`
).all(embeddingJson, topK);
```

## Error Handling
- All actions must validate input and return clear error messages for missing/invalid arguments.
- Handle errors for missing sqlite-vec extension, Nomic model, or database issues.
- Return human-readable errors for all operational failures.

## Output Format
- All outputs must be human-readable and consistent with opencode tool standards.
- For `list` and `search`, return JSON arrays.

## Usage Examples

### Store a key-value pair
```
{
  "action": "store",
  "key": "apple computer",
  "value": "fruit company / hardware vendor"
}
```

### Retrieve a value
```
{
  "action": "retrieve",
  "key": "apple computer"
}
```

### Delete a key
```
{
  "action": "delete",
  "key": "apple computer"
}
```

### List keys
```
{
  "action": "list",
  "limit": 10
}
```

### Similarity search
```
{
  "action": "search",
  "query": "fruit drink",
  "topK": 5
}
```

### Set database path
```
{
  "action": "set_database",
  "filename": "/path/to/vector-db.sqlite"
}
```

## Testing Requirements
- Unit and integration tests for all actions, including edge cases and error handling.
- Test with valid and invalid inputs.
- Test database initialization, switching, and extension loading.

## Limitations
- Requires sqlite-vec extension to be available in `./lib/vec0.dylib`.
- Requires @xenova/transformers package to be installed.
- Only supports text keys and values.
- Embedding dimension is fixed at 384 (Xenova/all-MiniLM-L6-v2).
- First run will download the model (~90MB) to local cache (`~/.cache/huggingface`).
- Subsequent runs are fully offline.

## Dependencies
- `@xenova/transformers` - For embedding generation
- `bun:sqlite` - SQLite database interface
- `sqlite-vec` extension - For vector storage and similarity search

## References
- See `docs/guides/sqlite3-vector-sec-example.md` for SQL usage examples.
- See `tool/key-value-store.ts` for interface inspiration.
- @xenova/transformers: https://github.com/xenova/transformers.js
