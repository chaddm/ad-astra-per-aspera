import { describe, it, expect } from "bun:test";
import calculator from "../tool/calculator";

// Minimal mock ToolContext with a real AbortSignal
const mockContext = {
  sessionID: "test-session",
  messageID: "test-message",
  agent: "test-agent",
  abort: (new AbortController()).signal,
};

describe("Calculator Tool", () => {
  describe("Basic arithmetic operations", () => {
    it("should add two numbers", async () => {
      const result = await calculator.execute({ expression: "2 + 2" }, mockContext);
      expect(result).toBe("4");
    });

    it("should subtract two numbers", async () => {
      const result = await calculator.execute({ expression: "10 - 5" }, mockContext);
      expect(result).toBe("5");
    });

    it("should multiply two numbers", async () => {
      const result = await calculator.execute({ expression: "3 * 4" }, mockContext);
      expect(result).toBe("12");
    });

    it("should divide two numbers", async () => {
      const result = await calculator.execute({ expression: "15 / 3" }, mockContext);
      expect(result).toBe("5");
    });

    it("should calculate modulo", async () => {
      const result = await calculator.execute({ expression: "10 % 3" }, mockContext);
      expect(result).toBe("1");
    });

    it("should calculate exponentiation", async () => {
      const result = await calculator.execute({ expression: "2 ** 8" }, mockContext);
      expect(result).toBe("256");
    });
  });

  describe("Complex expressions", () => {
    it("should handle expressions with parentheses", async () => {
      const result = await calculator.execute({ expression: "(5 + 3) * 2" }, mockContext);
      expect(result).toBe("16");
    });

    it("should handle nested parentheses", async () => {
      const result = await calculator.execute({ expression: "((2 + 3) * 4) - 1" }, mockContext);
      expect(result).toBe("19");
    });

    it("should handle multiple operations", async () => {
      const result = await calculator.execute({ expression: "2 + 3 * 4 - 1" }, mockContext);
      expect(result).toBe("13");
    });

    it("should handle division in complex expressions", async () => {
      const result = await calculator.execute({ expression: "(10 - 2) / (3 + 1)" }, mockContext);
      expect(result).toBe("2");
    });
  });

  describe("Decimal numbers", () => {
    it("should handle decimal addition", async () => {
      const result = await calculator.execute({ expression: "3.14 + 2.86" }, mockContext);
      expect(result).toBe("6");
    });

    it("should handle decimal multiplication", async () => {
      const result = await calculator.execute({ expression: "3.14 * 2" }, mockContext);
      expect(result).toBe("6.28");
    });

    it("should handle decimal division", async () => {
      const result = await calculator.execute({ expression: "5.5 / 2" }, mockContext);
      expect(result).toBe("2.75");
    });
  });

  describe("Error handling", () => {
    it("should return error for empty expression", async () => {
      const result = await calculator.execute({ expression: "" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("empty");
    });

    it("should return error for whitespace-only expression", async () => {
      const result = await calculator.execute({ expression: "   " }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("empty");
    });

    it("should return error for invalid characters", async () => {
      const result = await calculator.execute({ expression: "2 + a" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("invalid characters");
    });

    it("should return error for function calls", async () => {
      const result = await calculator.execute({ expression: "alert(1)" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("invalid characters");
    });

    it("should return error for unbalanced parentheses (missing closing)", async () => {
      const result = await calculator.execute({ expression: "(2 + 3" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("parentheses");
    });

    it("should return error for unbalanced parentheses (missing opening)", async () => {
      const result = await calculator.execute({ expression: "2 + 3)" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("parentheses");
    });

    it("should return error for expressions with semicolons", async () => {
      const result = await calculator.execute({ expression: "2 + 3; alert(1)" }, mockContext);
      expect(result).toContain("Error");
      expect(result).toContain("invalid characters");
    });
  });

  describe("Edge cases", () => {
    it("should handle expressions with whitespace", async () => {
      const result = await calculator.execute({ expression: "  2   +   3  " }, mockContext);
      expect(result).toBe("5");
    });

    it("should handle negative numbers", async () => {
      const result = await calculator.execute({ expression: "-5 + 3" }, mockContext);
      expect(result).toBe("-2");
    });

    it("should handle zero", async () => {
      const result = await calculator.execute({ expression: "0 + 0" }, mockContext);
      expect(result).toBe("0");
    });

    it("should handle large numbers", async () => {
      const result = await calculator.execute({ expression: "999999 + 1" }, mockContext);
      expect(result).toBe("1000000");
    });
  });
});
