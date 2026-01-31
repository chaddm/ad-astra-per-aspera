# Calculator Tool Specification

## Overview

The Calculator tool provides the ability to evaluate mathematical expressions written in LaTeX syntax, with support for variable substitution. It is designed to be used as a plugin/tool in the OpenCode ecosystem and is implemented as a TypeScript module compatible with the Bun runtime.

## Purpose

To supply users with:

- A way to evaluate mathematical expressions written in LaTeX format
- Support for variable substitution within expressions
- Numerical computation results for valid mathematical expressions
- Clear error messages for invalid expressions or operations

## Requirements

### Functional Requirements

1. **LaTeX Expression Evaluation**: The tool must accept a LaTeX-compliant mathematical expression string and evaluate it to produce a numerical result.

2. **Variable Substitution**: The tool must accept an optional object containing variable names (keys) and their corresponding numerical values, and substitute these variables into the expression before evaluation.

3. **Expression Validation**: The tool must validate that the input expression is valid LaTeX math syntax and return clear error messages for invalid expressions.

4. **Numerical Output**: The tool must return numerical results for successfully evaluated expressions.

5. **Error Handling**: The tool must handle and report errors clearly, including:
   - Invalid LaTeX syntax
   - Undefined variables (variables used in expression but not provided in substitution object)
   - Mathematical errors (division by zero, domain errors, etc.)
   - Invalid variable values (non-numeric values)

### Non-Functional Requirements

1. **Bun Compatibility**: The tool must be compatible with the Bun runtime.

2. **TypeScript**: The tool must be implemented in TypeScript with proper type annotations.

3. **Dependencies**: The tool should use actively maintained npm packages that work with Bun. Based on research, the recommended approach is:
   - **Primary**: `mathlive` + `@cortex-js/compute-engine` (most robust LaTeX support)
   - **Alternative**: `nerdamer` (simpler, but limited LaTeX support)

4. **Documentation**: The tool must include JSDoc comments for all exported functions following OpenCode code standards.

5. **Plugin Integration**: The tool must follow the OpenCode custom tool pattern using the `tool()` helper from `@opencode-ai/plugin`.

## Implementation Details

### Tool Interface

**Tool Name**: `calculator`

**Function Call**: `calculate`

**Arguments**:
- `expression` (required): A string containing a LaTeX-compliant mathematical expression
- `variables` (optional): An object with variable names as keys and numerical values as values

**Returns**: 
- A number containing the numerical result of the evaluation
- Throws an error with a descriptive message if evaluation fails

### Supported LaTeX Syntax

The tool supports LaTeX math syntax as provided by tex-math-parser:
- Basic arithmetic: `+`, `-`, `*`, `/`, `\cdot`
- Exponentiation: `^`, `x^2`, `x^{n}`
- Fractions: `\frac{a}{b}`
- Square roots: `\sqrt{x}`, `\sqrt[n]{x}`
- Trigonometric functions: `\sin`, `\cos`, `\tan`, etc.
- Logarithms: `\log`, `\ln`
- Parentheses and grouping: `(`, `)`, `{`, `}`
- Standard functions: `\exp`, `\abs`, etc.
- Variables: Standard alphanumeric identifiers (e.g., `x`, `y`, `alpha`)

**Note**: LaTeX Greek letter syntax (`\alpha`, `\beta`) is NOT supported for variable names. Use plain text equivalents (`alpha`, `beta`) instead.

### Variable Substitution Format

Variables should be provided as a plain JavaScript object:

```typescript
{
  "x": 5,
  "y": 10,
  "alpha": 3.14
}
```

Variables in the LaTeX expression can be referenced as:
- Simple variables: `x`, `y`, `z`
- Named variables: `alpha`, `beta`, `gamma` (plain text, not LaTeX syntax)

## Acceptance Criteria

- [ ] The tool can evaluate basic arithmetic expressions in LaTeX format (e.g., `2 + 2`, `\frac{1}{2}`)
- [ ] The tool can evaluate expressions with exponents (e.g., `x^2`, `2^{10}`)
- [ ] The tool can evaluate expressions with square roots (e.g., `\sqrt{16}`, `\sqrt{x}`)
- [ ] The tool can evaluate trigonometric expressions (e.g., `\sin(0)`, `\cos(\pi)`)
- [ ] The tool accepts a variables object and correctly substitutes values (e.g., `x + y` with `{x: 5, y: 10}` returns `15`)
- [ ] The tool returns clear error messages for invalid LaTeX syntax
- [ ] The tool returns clear error messages for undefined variables
- [ ] The tool returns clear error messages for mathematical errors (division by zero, etc.)
- [ ] The tool works without the variables parameter (for expressions with only constants)
- [ ] The tool follows OpenCode custom tool patterns and uses the `tool()` helper
- [ ] The tool includes proper TypeScript type annotations
- [ ] The tool includes JSDoc documentation
- [ ] The tool is compatible with Bun runtime
- [ ] The tool uses Zod for argument validation with `.describe()` on all arguments

## Example Usage

### Basic Arithmetic

```typescript
// Input
{
  expression: "2 + 2"
}

// Output
4
```

### Fractions

```typescript
// Input
{
  expression: "\\frac{1}{2} + \\frac{1}{4}"
}

// Output
0.75
```

### Variable Substitution

```typescript
// Input
{
  expression: "x^2 + 2*x + 1",
  variables: { x: 3 }
}

// Output
16
```

### Complex Expression

```typescript
// Input
{
  expression: "\\frac{-b + \\sqrt{b^2 - 4*a*c}}{2*a}",
  variables: { a: 1, b: -5, c: 6 }
}

// Output
3
```

### Error Cases

```typescript
// Undefined variable
{
  expression: "x + y",
  variables: { x: 5 }
}
// Throws: Error with message about undefined variable 'y'

// Invalid syntax
{
  expression: "2 + + 2"
}
// Throws: Error with message about invalid LaTeX syntax

// Division by zero
{
  expression: "\\frac{1}{0}"
}
// Throws: Error with message about division by zero or returns Infinity (depends on mathjs behavior)
```

## Out of Scope

- Symbolic manipulation (returning expressions rather than numerical values)
- Equation solving (e.g., solve for x)
- Matrix operations
- Complex number support (unless library provides it automatically)
- Custom function definitions
- Step-by-step solutions
- LaTeX rendering or display
- Support for non-mathematical LaTeX commands

## Technical Notes

### Selected Library: mathjs + tex-math-parser

**Installation**:
```bash
bun add mathjs tex-math-parser
```

**Approach**:
1. Use `tex-math-parser` to parse LaTeX string to mathjs expression tree
2. Use mathjs to evaluate the expression tree with variable substitution
3. Return numerical result or error message

**Example Implementation Pattern**:
```typescript
import { parseTex } from 'tex-math-parser';
import { create, all } from 'mathjs';

const math = create(all);

// Parse LaTeX to mathjs expression tree
const tree = parseTex(latexString);

// Compile the expression
const compiledExpression = tree.compile();

// Evaluate with variable substitution
const scope = variables || {};
const result = compiledExpression.evaluate(scope);

// Return numeric value
return result;
```

**LaTeX Support**:
- Basic operators: `+`, `-`, `*`, `/`, `^`, `\cdot`
- Fractions: `\frac{a}{b}`
- Square roots: `\sqrt{x}`, `\sqrt[n]{x}`
- Trigonometric: `\sin`, `\cos`, `\tan`, etc.
- Functions: `\log`, `\ln`, `\exp`, `\abs`
- Parentheses: Standard grouping
- Variables: Standard alphanumeric (e.g., `x`, `y`, `alpha`)

**Error Handling**:
- tex-math-parser throws errors for invalid LaTeX syntax
- mathjs throws errors for undefined variables or mathematical errors
- Both provide detailed error messages that can be passed through

## Dependencies

Required npm packages:
- `@opencode-ai/plugin` (already available in OpenCode)
- `zod` (already available in OpenCode)
- `mathjs` (to be installed)
- `tex-math-parser` (to be installed)

## File Location

`tool/calculator.ts`

## Testing

### Test File Location

`tests/calculator.test.ts`

### Testing Approach

**Unit Tests**:
- Unit tests can directly import and call the tool's exported functions
- Test the calculation logic, error handling, and edge cases
- Use standard test frameworks (e.g., Bun's built-in test runner)

**Integration Tests**:
- To test the tool as it runs within OpenCode, use: `opencode run "<instructions>"`
- Example: `opencode run "Use the calculator tool to evaluate 2 + 2"`
- **Important**: Do not attempt to call the tool directly from within an OpenCode session
- Tools are loaded at OpenCode startup, so any tool changes will NOT be reflected in the current running system
- Restart OpenCode to pick up tool changes for integration testing

### Test-Driven Development Process

**MANDATORY**: Follow this iterative development pattern:

1. **Write a test** for a specific behavior or requirement
2. **Run the test** and validate it FAILS because the tool doesn't conform to the expected behavior
   - Test failure must be due to missing/incorrect implementation, NOT because of test code errors
   - If the test has a code error, fix the test first before proceeding
3. **Implement the minimum code** in the tool to make that specific test pass
4. **Run the test again** and validate it PASSES
5. **Repeat** for the next test case

This proves as you go that the work is operating as expected. Each test validates a specific piece of functionality before moving to the next.

**Example workflow**:
```bash
# Cycle 1: Basic arithmetic
# 1. Write test for "2 + 2"
# 2. Run test → FAILS (tool not implemented yet)
# 3. Implement basic evaluation
# 4. Run test → PASSES

# Cycle 2: Variable substitution
# 1. Write test for "x + y" with variables
# 2. Run test → FAILS (variable substitution not implemented)
# 3. Implement variable substitution
# 4. Run test → PASSES

# Continue for each requirement...
```

### Integration Test Validation

**MANDATORY**: After all unit tests pass, validate the tool works within OpenCode:

1. **Restart OpenCode** to load the new tool (tools are loaded at startup)
2. **Run integration test** using `opencode run` with a sample calculation
3. **Verify** the tool is called successfully and returns the expected result

**Example integration test**:
```bash
# Test basic arithmetic through OpenCode
opencode run "Use the calculator tool to evaluate 2 + 2"
# Expected: Tool returns 4

# Test LaTeX expression through OpenCode  
opencode run "Use the calculator tool to calculate \\frac{1}{2} + \\frac{1}{4}"
# Expected: Tool returns 0.75
# Note: Double backslash (\\) is required in shell commands for escaping

# Test variable substitution through OpenCode
opencode run "Use the calculator tool to evaluate x^2 + 1 where x is 3"
# Expected: Tool returns 10
```

**Note on LaTeX Backslash Escaping**:
- In shell/command line: Use double backslash `\\frac` (shell escaping)
- In TypeScript/JavaScript code: Use single backslash `\frac` (string literal)
- In JSON: Use double backslash `"\\frac"` (JSON escaping)
- OpenCode will handle the escaping automatically when passing expressions to the tool

**Integration test acceptance criteria**:
- [ ] OpenCode successfully loads the calculator tool on startup
- [ ] The tool can be invoked via natural language instructions
- [ ] The tool correctly processes LaTeX expressions
- [ ] The tool returns numeric results as expected
- [ ] Error messages are properly surfaced when expressions are invalid

### Running Tests

```bash
# Run unit tests
bun test tests/calculator.test.ts

# Integration test (requires OpenCode restart after tool changes)
opencode run "Calculate \\frac{1}{2} + \\frac{1}{4}"
```

## Associated Documentation

This specification file: `tool/calculator_spec.md`
