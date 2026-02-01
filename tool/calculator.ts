import { tool } from "@opencode-ai/plugin";

/**
 * Safely evaluates a mathematical expression string
 * @param expression - Mathematical expression to evaluate
 * @returns Result of the calculation or error message
 */
const evaluateMathExpression = (expression: string): string => {
  // Guard clause for empty expression
  if (!expression || expression.trim() === '') {
    return 'Error: Expression cannot be empty';
  }

  try {
    // Remove any whitespace
    const cleanedExpression = expression.trim();

    // Validate that expression only contains safe characters
    // Allow: digits, operators (+, -, *, /, %, **), parentheses, decimal points, and spaces
    const safePattern = /^[\d+\-*/%().\s**]+$/;
    if (!safePattern.test(cleanedExpression)) {
      return 'Error: Expression contains invalid characters. Only digits, +, -, *, /, %, **, (), and . are allowed';
    }

    // Check for balanced parentheses
    let parenthesesCount = 0;
    for (const char of cleanedExpression) {
      if (char === '(') parenthesesCount++;
      if (char === ')') parenthesesCount--;
      if (parenthesesCount < 0) {
        return 'Error: Unbalanced parentheses';
      }
    }
    if (parenthesesCount !== 0) {
      return 'Error: Unbalanced parentheses';
    }

    // Use Function constructor to safely evaluate the expression
    // This is safer than eval() as it doesn't have access to local scope
    const result = new Function(`return ${cleanedExpression}`)();

    // Check if result is a valid number
    if (typeof result !== 'number' || !isFinite(result)) {
      return 'Error: Expression did not evaluate to a valid number';
    }

    return result.toString();
  } catch (error) {
    return `Error: Failed to evaluate expression: ${error instanceof Error ? error.message : String(error)}`;
  }
};

export default tool({
  description: "Evaluate a mathematical expression and return the result. Supports JavaScript math operators: +, -, *, /, %, ** (exponentiation), and parentheses.",
  args: {
    expression: tool.schema.string().describe("Mathematical expression to evaluate (e.g., '2 + 2', '(5 * 3) / 2', '2 ** 8')")
  },
  async execute(args, context) {
    return evaluateMathExpression(args.expression);
  }
});
