import { describe, it, expect } from "bun:test";
import { uuid } from "../tool/utilities";

// Regex for RFC4122 v4 UUID
const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Minimal mock ToolContext with a real AbortSignal
const mockContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: (new AbortController()).signal,
};

describe("Utilities Tool - uuid", () => {
  it("should return a string", async () => {
    const result = await uuid.execute({}, mockContext);
    expect(typeof result).toBe("string");
  });

  it("should return a valid RFC4122 v4 UUID", async () => {
    const result = await uuid.execute({}, mockContext);
    expect(result).toMatch(UUID_V4_REGEX);
  });

  it("should return unique values on multiple calls", async () => {
    const uuids = new Set();
    for (let i = 0; i < 20; i++) {
      const result = await uuid.execute({}, mockContext);
      expect(result).toMatch(UUID_V4_REGEX);
      uuids.add(result);
    }
    expect(uuids.size).toBe(20);
  });

  it("should not require any arguments", async () => {
    const result = await uuid.execute({}, mockContext);
    expect(typeof result).toBe("string");
    expect(result).toMatch(UUID_V4_REGEX);
  });

  it("should handle errors gracefully (simulate failure)", async () => {
    // Simulate error by temporarily replacing crypto.randomUUID
    const originalCrypto = globalThis.crypto;
    globalThis.crypto = { randomUUID: () => { throw new Error("Simulated failure"); } } as any;
    let result;
    try {
      result = await uuid.execute({}, mockContext);
      expect(result).toMatch(UUID_V4_REGEX); // Should fallback to polyfill
    } finally {
      globalThis.crypto = originalCrypto;
    }
  });
});
