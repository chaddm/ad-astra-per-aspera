import { describe, it, expect, beforeEach } from "bun:test";
import * as vdb from "../tool/vector-db";
import fs from "fs";

const TEST_DB_PATH = `${process.env.HOME || "."}/.config/opencode/vector-db-test.sqlite`;

/**
 * Reset the test database by removing it.
 */
function resetDb() {
  try {
    fs.unlinkSync(TEST_DB_PATH);
  } catch {}
}

// Set the database to the test DB before all tests
vdb.setDatabasePath(TEST_DB_PATH);

describe("Vector DB Tool", () => {
  beforeEach(() => {
    resetDb();
  });

  it("should store a value with embedding and return a success message", async () => {
    const result = await vdb.store("apple computer", "fruit company / hardware vendor");
    expect(result).toBe('Key "apple computer" stored successfully with embedding.');
  });

  it("should update an existing key with new value and embedding", async () => {
    await vdb.store("fruit", "apple");
    const result = await vdb.store("fruit", "banana");
    expect(result).toBe('Key "fruit" stored successfully with embedding.');
    expect(vdb.retrieve("fruit")).toBe("banana");
  });

  it("should retrieve a value for an existing key", async () => {
    await vdb.store("test-key", "test-value");
    expect(vdb.retrieve("test-key")).toBe("test-value");
  });

  it("should return empty string for non-existent key on retrieve", () => {
    expect(vdb.retrieve("nonexistent")).toBe("");
  });

  it("should delete a key and return the key", async () => {
    await vdb.store("delete-me", "goodbye");
    const result = vdb.del("delete-me");
    expect(result).toBe("delete-me");
    expect(vdb.retrieve("delete-me")).toBe("");
  });

  it("should return empty string when deleting a non-existent key", () => {
    expect(vdb.del("ghost-key")).toBe("");
  });

  it("should list all keys with default limit", async () => {
    for (let i = 0; i < 10; i++) {
      await vdb.store(`key-${i}`, `value-${i}`);
    }
    const keys = JSON.parse(vdb.list());
    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBe(10);
  });

  it("should list keys with custom limit and offset", async () => {
    for (let i = 0; i < 20; i++) {
      await vdb.store(`item-${i}`, `val-${i}`);
    }
    const keys = JSON.parse(vdb.list(5, 0));
    expect(keys.length).toBe(5);
    
    const keysOffset = JSON.parse(vdb.list(5, 5));
    expect(keysOffset.length).toBe(5);
    expect(keysOffset[0]).not.toBe(keys[0]);
  });

  it("should return an empty array when no keys exist", () => {
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
    
    // Each result should have key, value, and score
    results.forEach((result: any) => {
      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("value");
      expect(result).toHaveProperty("score");
      expect(typeof result.score).toBe("number");
    });
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

  it("should handle store with empty key gracefully", async () => {
    const result = await vdb.store("", "empty-key-value");
    expect(result).toMatch(/stored successfully|Error/);
  });

  it("should search with default topK when not specified", async () => {
    for (let i = 0; i < 10; i++) {
      await vdb.store(`test-${i}`, `content-${i}`);
    }
    
    const results = JSON.parse(await vdb.search("test"));
    expect(results.length).toBeLessThanOrEqual(5); // Default topK is 5
  });
});
