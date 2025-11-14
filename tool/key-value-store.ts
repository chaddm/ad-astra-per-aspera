import { tool } from "@opencode-ai/plugin";
import { Database } from "bun:sqlite";
import { z } from "zod";

const DB_PATH = `${process.env.HOME || "."}/.config/opencode/key-value-store.sqlite`;

function getDb() {
  const db = new Database(DB_PATH, { create: true });
  db.run(`CREATE TABLE IF NOT EXISTS objects (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT
  )`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_key ON objects(key)`);
  return db;
}

export function store(key: string, value: string): string {
  try {
    const db = getDb();
    db.query(
      `INSERT INTO objects (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value=excluded.value`
    ).run(key, value);
    return `Key "${key}" stored successfully.`;
  } catch (e) {
    return `Error storing key: ${e instanceof Error ? e.message : String(e)}`;
  }
}

export function retrieve(key: string): string {
  try {
    const db = getDb();
    const row = db.query(`SELECT value FROM objects WHERE key = ?1`).get(key);
    if (!row || typeof row !== 'object' || row === null) return "";
    const value = (row as Record<string, any>)["value"];
    if (typeof value !== "string") return "";
    return value;
  } catch (e) {
    return "";
  }
}

export function del(key: string): string {
  try {
    const db = getDb();
    const row = db.query(`SELECT key FROM objects WHERE key = ?1`).get(key);
    if (!row || typeof row !== 'object' || row === null) return "";
    db.query(`DELETE FROM objects WHERE key = ?1`).run(key);
    return key;
  } catch (e) {
    return "";
  }
}

export function list(): string {
  try {
    const db = getDb();
    const rows = db.query(`SELECT key FROM objects LIMIT 50`).all();
    if (!rows.length) return "[]";
    // Output as a human-readable array of keys
    return JSON.stringify(rows.map((r: any) => r.key));
  } catch (e) {
    return "[]";
  }
}

export default tool({
  description: "A persistent key-value store (SQLite-backed) with store, retrieve, delete, and list functions. Outputs are human-readable and follow the OpenCode spec.",
  args: {
    action: z.enum(["store", "retrieve", "delete", "list"]),
    key: z.string().optional(),
    value: z.string().optional(),
  },
  async execute(args, context) {
    const { action, key, value } = args;
    switch (action) {
      case "store":
        if (!key || typeof value !== "string") return "Key and value required.";
        return store(key, value);
      case "retrieve":
        if (!key) return "Key required.";
        return retrieve(key);
      case "delete":
        if (!key) return "Key required.";
        return del(key);
      case "list":
        return list();
      default:
        return "Unknown action. Use store, retrieve, delete, or list.";
    }
  },
});
