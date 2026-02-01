# Balanced Brackets Opencode Custom Tool

The Balanced Brackets Tool is a utility designed to help an agent with the task of
handling and validating balanced brackets in strings. It can be used to check if a
string has balanced brackets, find the position of unbalanced brackets, and provide
suggestions for correcting unbalanced brackets. The tool supports JavaScript-style
bracketed code, including code blocks, strings and comments. The tool can test
strings and files.

## Features

- **Check Balanced Brackets**: Determine if the contents of a string or file have
  balanced brackets. If the brackets are unbalanced, the tool will provide the
  position line and column of the first unbalanced bracket.

- **Determine Bracket Positions**: Given a line and column in the file, determine the
  position of the matching bracket, if it exists.

- **Bracket Digest**: Generate a summary of the bracket structure in a string or
  file, including the types of brackets used and their nesting levels.

## Implementation Approach for Feature 1: Check Balanced Brackets

### Design Decision: Use Acorn Tokenizer

After research, we will use the Acorn JavaScript parser/tokenizer for the first feature implementation. This provides:
- Accurate tokenization of JavaScript/TypeScript code
- Automatic handling of strings, comments, template literals, and regexes
- Location tracking (line/column) for each token
- Lightweight and fast performance
- Compatible with Bun runtime

### Algorithm: Stack-Based Bracket Matching

1. **Tokenization Phase**: Use Acorn to tokenize the input code
2. **Filtering Phase**: Process only bracket tokens in CODE context (automatically handled by Acorn)
3. **Matching Phase**: Use stack-based algorithm:
   - Push opening brackets `(`, `{`, `[` onto stack with position
   - Pop and match closing brackets `)`, `}`, `]`
   - Track mismatches and report positions
4. **Reporting Phase**: Return unbalanced bracket positions with line/column

### Key Benefits

- **Accurate**: Acorn correctly ignores brackets in strings, comments, template literals, and regexes
- **Precise**: Provides exact line and column numbers for error reporting
- **Maintainable**: Uses well-tested library instead of custom lexer
- **Edge Cases**: Handles nested template literals `${...}`, regex patterns, and escape sequences

### Dependencies Required

```bash
bun add acorn
bun add -d @types/acorn
```

### Data Structures

```typescript
interface BracketPosition {
  type: '(' | ')' | '{' | '}' | '[' | ']';
  line: number;
  column: number;
}

interface UnbalancedBracket extends BracketPosition {
  message: string;
  expectedType?: string; // For mismatched closing brackets
}

interface BalanceResult {
  balanced: boolean;
  errors: UnbalancedBracket[];
  totalBrackets: number;
}
```

### Tool Interface

```typescript
export default tool({
  description: "Check if JavaScript/TypeScript code has balanced brackets. Reports line and column of first unbalanced bracket.",
  args: {
    content: tool.schema.string().optional().describe("Code string to check for balanced brackets"),
    filePath: tool.schema.string().optional().describe("Path to file to check for balanced brackets"),
  },
  async execute(args, context) {
    // Implementation will go here
  }
});
```

At least one of `content` or `filePath` must be provided. The tool will:
1. Read file if `filePath` provided, otherwise use `content`
2. Tokenize using Acorn
3. Match brackets using stack algorithm
4. Return balance result with error positions

### Error Messages

- "Unmatched closing bracket '}' at line X, column Y"
- "Expected closing bracket for '{' opened at line X, column Y"
- "Unmatched opening bracket '(' at line X, column Y (reached end of file)"
