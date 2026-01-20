# Text Patcher Tool Specification

## Overview

The Text Patcher tool provides utilities for reading and writing files with integrity checks to prevent accidental file corruption. It is designed to be used as a plugin/tool in the OpenCode ecosystem, solving the problem of agents incorrectly updating files, either by accidentally replacing the entire contents or modifying the wrong places.

## Purpose

Text Patcher solves the problem of agents updating files incorrectly by:

- Providing a token-based integrity system using SHA hashing
- Preventing accidental whole-file replacement
- Ensuring patches are applied to the correct file state
- Supporting precise row-based file modifications
- Rejecting patches when the underlying file has changed

## Workflow

### 1. Read a File

**`text_read`** - Get a file handle and contents

- Accepts a filename
- Returns a token (SHA hash of the file) and file contents
- By default, returns the first 40 rows of the file
- Maximum number of rows: 100
- Accepts optional parameters for rows:
  - `offset`/`limit` (e.g., offset: 10, limit: 20)
  - `start`/`end` (e.g., start: 10, end: 30)
- Rows are 1-based

**Return Format for `text_read`:**

```
---
filename: <filename>
token: <sha256-hash>
offset: <offset>
limit: <limit>
start: <start>
end: <end>
---
00001|<content of row 1>
00002|<content of row 2>
00003|<content of row 3>
...
```

### 2. Patch the File

**`text_patch`** - Update one or more rows with content

- Accepts:
  - `filename`: The file to patch
  - `token`: The SHA token from `text_read`
  - `patches`: Array of patch operations

**Patch Format (YAML):**

```yaml
filename: <filename>
token: <token>
patches:
  - offset: 10
    limit: 5
    rows:
      - Something
      - Something
      - Something
  - offset: 30
    limit: 1
    rows:
      - Another thing
      - Another thing
      - Another thing
```

**Integrity Verification:**

- The file's SHA is computed before applying patches
- If the SHA has changed since the token was issued, the patch is rejected
- Error response indicates the file must be read again
- If successful, responds with success confirmation

## Requirements

### Functional Requirements

1. **Text Read (`text_read`)**:
   - Accepts a file path as input
   - Accepts optional row selection parameters (offset/limit or start/end)
   - Defaults to first 40 rows
   - Maximum of 100 rows per read
   - Computes and returns SHA hash as token in frontmatter
   - Returns formatted output with row numbers (1-based, 5 digits)
   - Returns YAML frontmatter with metadata including token
   - Returns error if file does not exist or cannot be read
   - For new files (that don't exist yet), returns `token: null` in frontmatter

2. **Text Patch (`text_patch`)**:
   - Accepts filename, token, and array of patches
   - Each patch specifies offset/limit or start/end and replacement rows
   - All patch offsets reference the original row numbers from `text_read`
   - Patches are sorted by offset (ascending) and applied sequentially
   - Cumulative shift is tracked: `shift += (rows.length - limit)` after each patch
   - Overlapping patches (based on original row numbers) are rejected as errors
   - Patches can insert rows (rows.length > limit), replace (equal), or delete (rows.length < limit or empty array)
   - Verifies file SHA matches provided token before applying patches (unless token is null for new files)
   - Rejects patches if file has changed (SHA mismatch)
   - Applies all patches atomically (all or nothing)
   - Can create new files when token is null
   - Returns success or detailed error message

3. **Error Handling**: The tool must handle errors gracefully:
   - Invalid file paths
   - Permission errors
   - File not found errors
   - SHA token mismatch (file changed)
   - Invalid row ranges
   - Patches exceeding file bounds
   - Return clear error messages for all failure cases

4. **Default Tool**: The default export provides information about the tool
   - No arguments required
   - Returns a description of available sub-tools

### Non-Functional Requirements

1. **Language Independence**: The specification must be implementable in any programming language
2. **Performance**: File operations should be efficient and handle large files appropriately
3. **Type Safety**: All functions should have proper TypeScript type definitions
4. **Readability**: Error messages and outputs must be clear and actionable
5. **Atomicity**: Patches must be applied atomically (all or nothing)
6. **Integrity**: SHA-based integrity checks must prevent stale updates

## Acceptance Criteria

### `text_read`
- [ ] Accepts a filename parameter
- [ ] Returns SHA token in frontmatter and file contents
- [ ] Returns `token: null` for non-existent files (new file case)
- [ ] Defaults to first 40 rows when no range specified
- [ ] Enforces maximum of 100 rows per read
- [ ] Accepts offset/limit parameters (1-based)
- [ ] Accepts start/end parameters (1-based, inclusive)
- [ ] Returns formatted output with 5-digit row numbers
- [ ] Returns YAML frontmatter with metadata including token
- [ ] Returns error for invalid row ranges

### `text_patch`
- [ ] Accepts filename, token, and patches array
- [ ] All patches reference original row numbers from read
- [ ] Sorts patches by offset before applying
- [ ] Detects overlapping patches and rejects as error
- [ ] Tracks cumulative shift when applying patches sequentially
- [ ] Applies patches using sequential splice with shift adjustment
- [ ] Verifies SHA token matches current file state (unless null)
- [ ] Rejects patches if file has changed (SHA mismatch)
- [ ] Supports creating new files with `token: null`
- [ ] Applies patches atomically (all or nothing)
- [ ] Supports multiple patches in one operation
- [ ] Supports offset/limit or start/end for each patch (1-based, inclusive)
- [ ] Returns success message on successful patch
- [ ] Returns detailed error on failure
- [ ] Handles patches that extend file length (insert)
- [ ] Handles patches that reduce file length (delete)
- [ ] Handles patches with empty rows array (pure deletion)

### General
- [ ] The tool has proper TypeScript type definitions
- [ ] The tool follows OpenCode custom tool conventions
- [ ] The tool exports both a default tool and named sub-tools
- [ ] Error handling is graceful and provides clear messages
- [ ] The tool is properly documented with JSDoc comments

## Example Usage

### Reading a File

```typescript
// Read first 40 rows (default)
const result = await text_patcher_text_read({ filename: "/path/to/file.txt" })

// Read specific range using offset/limit
const result = await text_patcher_text_read({ 
  filename: "/path/to/file.txt",
  offset: 10,
  limit: 20
})

// Read specific range using start/end
const result = await text_patcher_text_read({ 
  filename: "/path/to/file.txt",
  start: 10,
  end: 30
})

// Returns:
// ---
// filename: /path/to/file.txt
// token: <sha256-hash>
// offset: 10
// limit: 20
// ---
// 00010|import { something } from 'somewhere'
// 00011|
// 00012|function example() {
// ...
```

### Patching a File

```typescript
const patch = {
  filename: "/path/to/file.txt",
  token: "a3f5b8c9d2e1...",
  patches: [
    {
      offset: 10,
      limit: 5,
      rows: [
        "// Updated comment",
        "function newImplementation() {",
        "  return true;",
        "}"
      ]
    },
    {
      offset: 30,
      limit: 1,
      rows: [
        "// Another update",
        "const value = 42;"
      ]
    }
  ]
}

const result = await text_patcher_text_patch(patch)
// Returns: { success: true, message: "Patches applied successfully" }

// Or on error:
// Returns: { success: false, error: "File has changed. Please read the file again." }
```

### Using the Default Tool

```typescript
const info = await text_patcher({})
// Returns: "Text Patcher tool - use text_read or text_patch sub-tools for file operations"
```

### Creating a New File

```typescript
// Read non-existent file first
const readResult = await text_patcher_text_read({ filename: "/path/to/new-file.txt" })
// Returns token: null in frontmatter

// Create the file with initial content
const patch = {
  filename: "/path/to/new-file.txt",
  token: null,
  patches: [
    {
      offset: 1,
      limit: 0,
      rows: [
        "// New file content",
        "const greeting = 'Hello, world!';",
        "",
        "export { greeting };"
      ]
    }
  ]
}

const result = await text_patcher_text_patch(patch)
// Returns: { success: true, message: "File created successfully" }
```

### Deleting Rows

```typescript
// Delete rows 5-10 (6 rows total)
const patch = {
  filename: "/path/to/file.txt",
  token: "a3f5b8c9d2e1...",
  patches: [
    {
      offset: 5,
      limit: 6,
      rows: []  // Empty array = deletion
    }
  ]
}

const result = await text_patcher_text_patch(patch)
// Returns: { success: true, message: "Patches applied successfully" }
```

## Implementation Notes

- Use SHA-256 or similar cryptographic hash for token generation
- Row numbers are 1-based for human readability
- Row numbers in output are formatted as 5-digit zero-padded strings (00001, 00002, etc.)
- Row ranges using start/end are inclusive (start: 10, end: 30 includes row 30)
- Offset/limit: `offset: 10, limit: 5` replaces rows 10-14 (5 rows starting at offset 10)
- Patches reference original row numbers from the read operation
- Patches are sorted by offset (ascending) before application
- Patches are applied sequentially using in-place array splice with cumulative shift tracking
- Shift calculation: `cumulativeShift += (rows.length - limit)` after each patch
- Overlapping patches (based on original row numbers) must be detected and rejected
- Empty rows in patch content should be preserved
- Empty rows array in a patch performs pure deletion
- File encoding should default to UTF-8
- Line endings should be preserved as-is from the original file
- New files can be created when token is null

## Out of Scope (Current Version)

- Binary file support
- Streaming for files larger than memory
- Concurrent multi-user editing
- Automatic conflict resolution
- Undo/redo functionality
- File backup/versioning
