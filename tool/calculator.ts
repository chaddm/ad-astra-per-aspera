import { tool } from "@opencode-ai/plugin";

interface CalculatorArgs {
  /** LaTeX-compliant mathematical expression string */
  expression: string;
  /** Optional object with variable names as keys and numerical values as values */
  variables?: Record<string, number>;
}

function validateExpression(expression: unknown): asserts expression is string {
  if (typeof expression !== 'string') {
    throw new Error(`Expression must be a string, got ${typeof expression}: ${JSON.stringify(expression)}`);
  }
  
  if (expression.trim() === '') {
    throw new Error('Expression cannot be empty');
  }
}

function validateVariables(variables?: Record<string, unknown>): void {
  if (!variables) return;
  for (const [key, value] of Object.entries(variables)) {
    if (typeof value !== 'number' || Number.isNaN(value)) {
      throw new Error(`Variable '${key}' must be a number, got ${typeof value}`);
    }
  }
}

/**
 * Calculate the result of a LaTeX mathematical expression
 * 
 * @description Evaluate mathematical expressions written in LaTeX syntax, with support for variable substitution
 * 
 * @example
 * calculate.execute({ expression: "2 + 2" }) // Returns: 4
 * 
 * @example
 * calculate.execute({ expression: "x^2 + 1", variables: { x: 3 } }) // Returns: 10
 * 
 * @example
 * calculate.execute({ expression: "\\frac{1}{2} + \\frac{1}{4}" }) // Returns: 0.75
 */
export default tool({
  description: "Evaluate mathematical expressions written in LaTeX syntax, with support for variable substitution",
  args: {
    expression: tool.schema.string().describe("LaTeX-compliant mathematical expression string"),
    variables: tool.schema.record(tool.schema.string(), tool.schema.number()).optional().describe("Optional object with variable names as keys and numerical values as values"),
  },
  async execute(args) {
    validateExpression(args.expression);
    validateVariables(args.variables);
    const { parseTex } = require("tex-math-parser");
    let tree;
    try {
      tree = parseTex(args.expression);
    } catch (err: any) {
      throw new Error(`Invalid LaTeX syntax: ${err.message}`);
    }
    let compiledExpression;
    try {
      compiledExpression = tree.compile();
    } catch (err: any) {
      throw new Error(`Invalid LaTeX syntax: ${err.message}`);
    }
    const scope = args.variables || {};
    try {
      const result = compiledExpression.evaluate(scope);
      return result;
    } catch (err: any) {
      if (err.message && /Undefined symbol/i.test(err.message)) {
        // Try to extract variable name
        const match = err.message.match(/Undefined symbol ([a-zA-Z0-9_]+)/);
        const varName = match ? match[1] : "unknown";
        throw new Error(`Undefined variable: ${varName}`);
      }
      throw new Error(`Mathematical error: ${err.message}`);
    }
  },
});

