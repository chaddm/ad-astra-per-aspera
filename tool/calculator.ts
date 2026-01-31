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
export const calculate = tool({
  description: "Evaluate mathematical expressions written in LaTeX syntax, with support for variable substitution",
  args: {
    expression: tool.schema.string().describe("LaTeX-compliant mathematical expression string"),
    variables: tool.schema.record(tool.schema.string(), tool.schema.number()).optional().describe("Optional object with variable names as keys and numerical values as values"),
  },
  async execute(args) {
    validateExpression(args.expression);
    
    const { parseTex } = require("tex-math-parser");
    
    const tree = parseTex(args.expression);
    const compiledExpression = tree.compile();
    const scope = args.variables || {};
    const result = compiledExpression.evaluate(scope);
    return result;
  },
});
