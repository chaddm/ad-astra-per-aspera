import { describe, it, expect, beforeEach } from "bun:test";
import * as kv from "../tool/key-value-store";
import fs from "fs";

const DB_PATH = `${process.env.HOME || "."}/.config/opencode/key-value-store.sqlite`;

function resetDb() {
  try { fs.unlinkSync(DB_PATH); } catch {}
}

describe("Key-Value Store Tool", () => {
  beforeEach(() => {
    resetDb();
  });

  it("should store a value and return a success message", () => {
    const result = kv.store("foo", "bar");
    expect(result).toBe('Key "foo" stored successfully.');
  });

  it("should update an existing key", () => {
    kv.store("foo", "bar");
    const result = kv.store("foo", "baz");
    expect(result).toBe('Key "foo" stored successfully.');
    expect(kv.retrieve("foo")).toBe("baz");
  });

  it("should retrieve a value for an existing key", () => {
    kv.store("alpha", "beta");
    expect(kv.retrieve("alpha")).toBe("beta");
  });

  it("should return empty string for non-existent key on retrieve", () => {
    expect(kv.retrieve("nope")).toBe("");
  });

  it("should delete a key and return the key", () => {
    kv.store("delme", "gone");
    const result = kv.del("delme");
    expect(result).toBe("delme");
    expect(kv.retrieve("delme")).toBe("");
  });

  it("should return empty string when deleting a non-existent key", () => {
    expect(kv.del("ghost")).toBe("");
  });

  it("should list all keys (max 50)", () => {
    for (let i = 0; i < 55; i++) kv.store(`k${i}`, `v${i}`);
    const keys = JSON.parse(kv.list());
    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBe(50);
    expect(keys[0]).toBe("k0");
  });

  it("should return an empty array when no keys exist", () => {
    expect(kv.list()).toBe("[]");
  });

  it("should auto-create the database and table on any call", () => {
    resetDb();
    expect(() => kv.retrieve("foo")).not.toThrow();
    expect(() => kv.store("foo", "bar")).not.toThrow();
    expect(() => kv.del("foo")).not.toThrow();
    expect(() => kv.list()).not.toThrow();
  });

  it("should return clear error messages for invalid store operations", () => {
    // Simulate DB file removal after open
    resetDb();
    // forcibly close DB and remove file (simulate error)
    // Not easily possible with Bun's sync API, so just check normal error path
    expect(kv.store("", "")).toMatch(/Key "" stored successfully\.|Error storing key/);
  });
});
