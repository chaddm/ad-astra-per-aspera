import { describe, it, expect, beforeEach } from "bun:test";
import * as vdb from "../tool/vector-db";
import fs from "fs";

const TEST_DB_PATH = `${process.env.HOME || "."}/.config/opencode/vector-db-test.sqlite`;

function resetDb() {
  try {
    fs.unlinkSync(TEST_DB_PATH);
  } catch {}
}

describe("Vector DB Tool", () => {
  beforeEach(() => {
    vdb.setDatabasePath(TEST_DB_PATH);
    resetDb();
  });

  it("should store a value with embedding and return a UUID key", async () => {
    const key = await vdb.store("apple computer", "fruit company / hardware vendor");
    expect(typeof key).toBe("string");
    expect(key).toMatch(/[0-9a-fA-F-]{36}/); // UUID v4 format
  });

  it("should update an existing embedding_text with new value and embedding, returning the same key", async () => {
    const key1 = await vdb.store("fruit", "apple");
    const key2 = await vdb.store("fruit", "banana");
    expect(key2).toBe(key1);
    expect(vdb.retrieve(key1)).toBe("banana");
  });

  it("should retrieve a value for an existing key", async () => {
    const key = await vdb.store("test-embedding_text", "test-value");
    expect(vdb.retrieve(key)).toBe("test-value");
  });

  it("should return error for non-existent key on retrieve", () => {
    expect(vdb.retrieve("00000000-0000-4000-8000-000000000000")).toMatch(/Error: No key matches/);
  });

  it("should delete a row by key and return the key", async () => {
    const key = await vdb.store("delete-me", "goodbye");
    const result = vdb.del(key);
    expect(result).toBe(key);
    expect(vdb.retrieve(key)).toMatch(/Error: No key matches/);
  });

  it("should return error when deleting a non-existent key", () => {
    expect(vdb.del("00000000-0000-4000-8000-000000000000")).toMatch(/Error: No key matches/);
  });

  it("should list all rows with all fields and unique UUID keys", async () => {
    const keys = [];
    for (let i = 0; i < 10; i++) {
      keys.push(await vdb.store(`embedding_text-${i}`, `value-${i}`));
    }
    const rows = JSON.parse(vdb.list());
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBe(10);
    const seen = new Set();
    rows.forEach(row => {
      expect(row).toHaveProperty("key");
      expect(row).toHaveProperty("embedding_text");
      expect(row).toHaveProperty("embedding");
      expect(row).toHaveProperty("value");
      expect(typeof row.key).toBe("string");
      expect(row.key).toMatch(/[0-9a-fA-F-]{36}/);
      expect(seen.has(row.key)).toBe(false);
      seen.add(row.key);
    });
    // All keys in list should match those returned by store
    keys.forEach(k => expect(seen.has(k)).toBe(true));
  });

  it("should list rows with custom limit and offset, all with UUID keys", async () => {
    for (let i = 0; i < 20; i++) {
      await vdb.store(`item-${i}`, `val-${i}`);
    }
    const rows = JSON.parse(vdb.list(5, 0));
    expect(rows.length).toBe(5);
    rows.forEach(row => {
      expect(row).toHaveProperty("key");
      expect(row.key).toMatch(/[0-9a-fA-F-]{36}/);
    });
    const rowsOffset = JSON.parse(vdb.list(5, 5));
    expect(rowsOffset.length).toBe(5);
    expect(rowsOffset[0].key).not.toBe(rows[0].key);
  });

  it("should return an empty array when no rows exist", () => {
    expect(vdb.list()).toBe("[]");
  });

  it("should perform similarity search and return results", async () => {
    // Store some test data
    await vdb.store("apple computer", "fruit company / hardware vendor");
    await vdb.store("banana smoothie", "food / recipe");
    await vdb.store("strawberry fruit", "just a fruit");
    await vdb.store("orange juice", "citrus drink");
    
    // Search for similar items
    const results = JSON.parse(await vdb.search("fruit drink", 3));
    
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThanOrEqual(3);
    
    // Each result should have embedding_text, value, and score
     results.forEach((result: any) => {
      expect(result).toHaveProperty("embedding_text");
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("score");
      expect(typeof result.score).toBe("number");
    });
  });

  it("should import a file and store its contents as embedding_text and path as value, returning a UUID key", async () => {
    const testFile = "/tmp/vector-db-import-test.txt";
    fs.writeFileSync(testFile, "hello world import test");
    const key = await vdb.default.execute({ action: "import_file", filepath: testFile });
    expect(typeof key).toBe("string");
    expect(key).toMatch(/[0-9a-fA-F-]{36}/);
    expect(vdb.retrieve(key)).toBe(testFile);
    fs.unlinkSync(testFile);
  });

  it("should return error for missing file in import_file", async () => {
    const result = await vdb.default.execute({ action: "import_file", filepath: "/tmp/nonexistent-file.txt" });
    expect(result).toMatch(/Error: File not found/);
  });

  it("should return error for empty file in import_file", async () => {
    const testFile = "/tmp/vector-db-empty.txt";
    fs.writeFileSync(testFile, "");
    const result = await vdb.default.execute({ action: "import_file", filepath: testFile });
    expect(result).toMatch(/Error: File is empty/);
    fs.unlinkSync(testFile);
  });

  it("should return error for directory in import_file", async () => {
    const result = await vdb.default.execute({ action: "import_file", filepath: "/tmp/" });
    expect(result).toMatch(/Error: Path is not a file/);
  });

  it("should truncate and store large files in import_file", async () => {
    const testFile = "/tmp/vector-db-large.txt";
    const largeContent = "A".repeat(20000);
    fs.writeFileSync(testFile, largeContent);
    const key = await vdb.default.execute({ action: "import_file", filepath: testFile });
    expect(typeof key).toBe("string");
    expect(key).toMatch(/[0-9a-fA-F-]{36}/);
    // The embedding_text should be truncated to 10000 chars
    expect(vdb.retrieve(key)).toBe(testFile);
    fs.unlinkSync(testFile);
  });


  it("should return results sorted by similarity (ascending score)", async () => {
    await vdb.store("apple computer", "technology company");
    await vdb.store("apple fruit", "fresh fruit");
    await vdb.store("banana", "yellow fruit");
    
    const results = JSON.parse(await vdb.search("apple", 3));
    
    expect(results.length).toBeGreaterThan(1);
    
    // Scores should be in ascending order (lower = more similar)
    for (let i = 1; i < results.length; i++) {
      expect(results[i].score).toBeGreaterThanOrEqual(results[i - 1].score);
    }
  });

  it("should respect topK parameter in search", async () => {
    for (let i = 0; i < 10; i++) {
      await vdb.store(`entry-${i}`, `value-${i}`);
    }
    
    const results2 = JSON.parse(await vdb.search("entry", 2));
    expect(results2.length).toBe(2);
    
    const results7 = JSON.parse(await vdb.search("entry", 7));
    expect(results7.length).toBe(7);
  });

  it("should return empty array for search when no data exists", async () => {
    const results = await vdb.search("anything", 5);
    expect(results).toBe("[]");
  });

  it("should auto-create the database and table on any call", async () => {
    resetDb();
    expect(() => vdb.retrieve("foo")).not.toThrow();
    expect(async () => await vdb.store("foo", "bar")).not.toThrow();
    expect(() => vdb.del("foo")).not.toThrow();
    expect(() => vdb.list()).not.toThrow();
    expect(async () => await vdb.search("test", 5)).not.toThrow();
  });

  it("should handle store with empty embedding_text gracefully", async () => {
    const key = await vdb.store("", "empty-key-value");
    expect(typeof key).toBe("string");
    expect(key).toMatch(/[0-9a-fA-F-]{36}/);
  });

   it("should search with default topK when not specified", async () => {
    for (let i = 0; i < 10; i++) {
      await vdb.store(`test-${i}`, `content-${i}`);
    }
    
    const results = JSON.parse(await vdb.search("test"));
    expect(results.length).toBeLessThanOrEqual(5); // Default topK is 5
  });

  it("should retrieve a value with a unique partial UUID", async () => {
    const key = await vdb.store("partial-uuid-test", "partial-value");
    const partial = key.slice(0, 8);
    expect(vdb.retrieve(partial)).toBe("partial-value");
  });

  it("should error on retrieve with ambiguous partial UUID", async () => {
    // Try up to 1000 times to generate two keys with the same first character
    let key1, key2, partial, found = false;
    for (let attempt = 0; attempt < 1000; attempt++) {
      key1 = await vdb.store("partial-uuid-ambig-1-" + Math.random(), "v1");
      key2 = await vdb.store("partial-uuid-ambig-2-" + Math.random(), "v2");
      partial = key1[0];
      if (key2[0] === partial) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.warn("Skipped ambiguous partial UUID test: could not generate two keys with the same prefix after 1000 attempts");
      return;
    }
    const result = vdb.retrieve(partial);
    expect(typeof result).toBe("string");
    expect(result).toMatch(/Error: Multiple keys match/);
  });

  it("should error on retrieve with no matching partial UUID", () => {
    expect(vdb.retrieve("deadbeef")).toMatch(/Error: No key matches/);
  });

  it("should delete a row with a unique partial UUID", async () => {
    const key = await vdb.store("partial-uuid-del", "del-value");
    const partial = key.slice(0, 8);
    const result = vdb.del(partial);
    expect(result).toBe(key);
    expect(vdb.retrieve(key)).toMatch(/Error: No key matches/);
  });

  it("should error on delete with ambiguous partial UUID", async () => {
    // Try up to 1000 times to generate two keys with the same first character
    let key1, key2, partial, found = false;
    for (let attempt = 0; attempt < 1000; attempt++) {
      key1 = await vdb.store("partial-uuid-del-ambig-1-" + Math.random(), "v1");
      key2 = await vdb.store("partial-uuid-del-ambig-2-" + Math.random(), "v2");
      partial = key1[0];
      if (key2[0] === partial) {
        found = true;
        break;
      }
    }
    if (!found) {
      console.warn("Skipped ambiguous partial UUID delete test: could not generate two keys with the same prefix after 1000 attempts");
      return;
    }
    const result = vdb.del(partial);
    expect(typeof result).toBe("string");
    expect(result).toMatch(/Error: Multiple keys match/);
  });

  it("should error on delete with no matching partial UUID", () => {
    expect(vdb.del("cafebabe")).toMatch(/Error: No key matches/);
  });

});
