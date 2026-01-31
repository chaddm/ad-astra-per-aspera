import { describe, test, expect } from "bun:test";
import { calculate } from "../tool/calculator";
import { spawn } from "bun";

describe("Calculator Tool", () => {
  test("basic arithmetic: 2 + 2", async () => {
    const result = await calculate.execute({ expression: "2 + 2" });
    expect(result).toBe(4);
  });

  test("fractions: \\frac{1}{2} + \\frac{1}{4}", async () => {
    const result = await calculate.execute({ expression: "\\frac{1}{2} + \\frac{1}{4}" });
    expect(result).toBe(0.75);
  });

  test("variable substitution: x^2 + 2*x + 1 with x=3", async () => {
    const result = await calculate.execute({ 
      expression: "x^2 + 2*x + 1", 
      variables: { x: 3 } 
    });
    expect(result).toBe(16);
  });

  test("complex expression: quadratic formula", async () => {
    const result = await calculate.execute({ 
      expression: "\\frac{-b + \\sqrt{b^2 - 4*a*c}}{2*a}",
      variables: {
        a: 1,
        b: -5,
        c: 6,
      }
    });
    expect(result).toBe(3);
  });

  test("error: undefined variable", async () => {
    await expect(calculate.execute({ 
      expression: "x + y", 
      variables: { x: 5 } 
    })).rejects.toThrow();
  });

  test("error: invalid LaTeX syntax", async () => {
    await expect(calculate.execute({ expression: "2 + + 2" })).rejects.toThrow();
  });

  test("trigonometric: \\sin(0) and \\cos(0)", async () => {
    const sinResult = await calculate.execute({ expression: "\\sin(0)" });
    const cosResult = await calculate.execute({ expression: "\\cos(0)" });
    expect(sinResult).toBe(0);
    expect(cosResult).toBe(1);
  });

  test("square root: \\sqrt{16}", async () => {
    const result = await calculate.execute({ expression: "\\sqrt{16}" });
    expect(result).toBe(4);
  });
});
