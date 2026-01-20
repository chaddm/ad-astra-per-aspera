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
  - `seek` (optional): JavaScript regular expression pattern to search for matching lines
- Rows are 1-based

**Return Format for `text_read`:**

```
---
filename: <filename>
token: <sha256-hash>
offset: <offset>
limit: <limit>
start: <start>
seek: <regex-pattern>
error: <error-message>
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
   - Accepts optional `seek` parameter with JavaScript regex pattern for searching
   - When `seek` is provided, searches from `offset` (default: 1) to `end` (default: min(file_length, 99999 - limit))
   - Returns first line matching the regex pattern as the new `offset`
   - Returns `limit` rows starting from the matched line
   - Cannot combine `seek` with `start` parameter (returns error)
   - Returns error "No match found." when no match exists
   - Maximum line number that can be returned is 99999
   - The `end` parameter is never returned in frontmatter output
   - All errors return frontmatter format with `error` property and appropriate metadata

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
   - All errors are returned in frontmatter format with an `error` property
   - Error responses include filename, token (SHA hash or null), and relevant parameters
   - Example error format should be shown

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
- [x] Accepts a filename parameter
- [x] Returns SHA token in frontmatter and file contents
- [x] Returns `token: null` for non-existent files (new file case)
- [x] Defaults to first 40 rows when no range specified
- [x] Enforces maximum of 100 rows per read
- [x] Accepts offset/limit parameters (1-based)
- [x] Accepts start/end parameters (1-based, inclusive)
- [x] Returns formatted output with 5-digit row numbers
- [x] Returns YAML frontmatter with metadata including token
- [x] Returns error for invalid row ranges
- [ ] Accepts optional `seek` parameter with JavaScript regex pattern
- [ ] `seek` searches from `offset` to `end` line range
- [ ] `seek` returns first matching line as new `offset`
- [ ] `seek` returns `limit` lines from matched line
- [ ] `seek` cannot be combined with `start` (returns error)
- [ ] `seek` returns frontmatter with error "No match found." when no match
- [ ] `end` parameter is never returned in frontmatter
- [ ] All errors return frontmatter format with `error` property
- [ ] Error responses include `token` (SHA hash or null)
- [ ] Maximum returned line number is 99999

### `text_patch`
- [x] Accepts filename, token, and patches array
- [x] All patches reference original row numbers from read
- [x] Sorts patches by offset before applying
- [x] Detects overlapping patches and rejects as error
- [x] Tracks cumulative shift when applying patches sequentially
- [x] Applies patches using sequential splice with shift adjustment
- [x] Verifies SHA token matches current file state (unless null)
- [x] Rejects patches if file has changed (SHA mismatch)
- [x] Supports creating new files with `token: null`
- [x] Applies patches atomically (all or nothing)
- [x] Supports multiple patches in one operation
- [x] Supports offset/limit or start/end for each patch (1-based, inclusive)
- [x] Returns success message on successful patch
- [x] Returns detailed error on failure
- [x] Handles patches that extend file length (insert)
- [x] Handles patches that reduce file length (delete)
- [x] Handles patches with empty rows array (pure deletion)

### General
- [x] The tool has proper TypeScript type definitions
- [x] The tool follows OpenCode custom tool conventions
- [x] The tool exports both a default tool and named sub-tools
- [x] Error handling is graceful and provides clear messages
- [x] The tool is properly documented with JSDoc comments

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

### Seeking with Regex

```typescript
// Find first function definition
const result = await text_patcher_text_read({ 
  filename: "/path/to/code.js",
  seek: "/^function\\s+\\w+/",
  limit: 10
})

// Returns (if match found at line 25):
// ---
// filename: /path/to/code.js
// token: <sha256-hash>
// offset: 25
// limit: 10
// seek: /^function\s+\w+/
// ---
// 00025|function myFunction() {
// 00026|  return true;
// ...

// Search within a specific range (lines 100-500)
const result = await text_patcher_text_read({ 
  filename: "/path/to/large-file.txt",
  seek: "/ERROR/i",
  offset: 100,
  end: 500,
  limit: 5
})

// No match found
const result = await text_patcher_text_read({ 
  filename: "/path/to/file.txt",
  seek: "/NotFound/"
})

// Returns:
// ---
// filename: /path/to/file.txt
// token: <sha256-hash>
// offset: 1
// limit: 40
// seek: /NotFound/
// error: No match found.
// ---
```

### Error Handling

```typescript
// Invalid parameters
const result = await text_patcher_text_read({ 
  filename: "/path/to/file.txt",
  offset: 0,
  limit: 10
})

// Returns:
// ---
// filename: /path/to/file.txt
// token: <sha256-hash>
// offset: 0
// limit: 10
// error: invalid: offset must be >= 1
// ---

// File permission error
const result = await text_patcher_text_read({ 
  filename: "/restricted/file.txt"
})

// Returns:
// ---
// filename: /restricted/file.txt
// token: null
// error: Could not read file: EACCES: permission denied
// ---
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
- When `seek` is provided, the search begins at `offset` (default: 1) and ends at `end` (default: min(file_length, 99999 - limit))
- The regex pattern in `seek` follows JavaScript regex syntax including flags (e.g., `/pattern/i` for case-insensitive)
- Only the first matching line is returned; subsequent matches are ignored
- The `end` parameter is never included in frontmatter output
- Error responses use frontmatter format with `error` property and include filename, token, and relevant parameters

## Out of Scope (Current Version)

- Binary file support
- Streaming for files larger than memory
- Concurrent multi-user editing
- Automatic conflict resolution
- Undo/redo functionality
- File backup/versioning
