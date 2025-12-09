import { describe, it, expect } from "bun:test";
import { call_me } from "../tool/foobar";

// Minimal mock ToolContext with a real AbortSignal
const mockContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: (new AbortController()).signal,
};

describe("Foobar Tool - call_me", () => {
  it("should return a string", async () => {
    const result = await call_me.execute({}, mockContext);
    expect(typeof result).toBe("string");
  });

  it("should return 'Tell a programmer joke.'", async () => {
    const result = await call_me.execute({}, mockContext);
    expect(result).toBe("Tell a programmer joke.");
  });

  it("should not require any arguments", async () => {
    const result = await call_me.execute({}, mockContext);
    expect(result).toBe("Tell a programmer joke.");
  });

  it("should return the same value on multiple calls", async () => {
    const result1 = await call_me.execute({}, mockContext);
    const result2 = await call_me.execute({}, mockContext);
    const result3 = await call_me.execute({}, mockContext);
    
    expect(result1).toBe("Tell a programmer joke.");
    expect(result2).toBe("Tell a programmer joke.");
    expect(result3).toBe("Tell a programmer joke.");
  });
});
