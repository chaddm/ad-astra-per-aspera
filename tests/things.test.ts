import { describe, it, expect, beforeEach, afterEach } from "bun:test";

const mockContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent", 
  abort: (new AbortController()).signal,
};

let originalExecSync: any;
let mockCalled: boolean;
let mockCommand: string;

describe("Things App Tool - Basic Tests", () => {
  beforeEach(() => {
    originalExecSync = require("child_process").execSync;
    mockCalled = false;
    mockCommand = "";
    
    require("child_process").execSync = function(command: string) {
      mockCalled = true;
      mockCommand = command;
    };
  });

  afterEach(() => {
    require("child_process").execSync = originalExecSync;
  });

  it("add function should work with valid title", async () => {
    const thing = await import("../tool/things");
    const result = await thing.add.execute({ title: "Test" }, mockContext);
    
    expect(mockCalled).toBe(true);
    expect(mockCommand).toContain("things:///add?title=Test");
    expect(result.success).toBe(true);
  });

  it("version function should work", async () => {
    const thing = await import("../tool/things");
    const result = await thing.version.execute({}, mockContext);
    
    expect(mockCalled).toBe(true); 
    expect(mockCommand).toContain("things:///version");
    expect(result.success).toBe(true);
  });
});
