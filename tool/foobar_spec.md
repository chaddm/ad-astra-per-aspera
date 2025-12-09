# foobar Tool Specification

## Overview

The `foobar` tool provides a simple function that returns a joke prompt. It's designed as a minimal example tool with no arguments.

## Tool Name

`foobar_call_me`

## Description

Returns a prompt to tell a joke.

## Functions

### call_me

Returns the string "Tell a joke."

**Arguments:**
- None

**Returns:**
- `string`: Always returns "Tell a joke."

**Example Usage:**

```typescript
// The LLM can call this tool with no arguments
foobar_call_me()
// Returns: "Tell a joke."
```

## Implementation Details

- **File**: `tool/foobar.ts`
- **Export**: Named export `call_me` and default export
- **Dependencies**: `@opencode-ai/plugin`
- **Runtime**: Compatible with Bun runtime

## Notes

- This tool takes no arguments and always returns the same string
- It serves as a simple example of custom tool creation in OpenCode
- The tool name in the system will be `foobar_call_me` (filename + export name)
