# Text Patcher Tool

## Overview

The **Text Patcher** tool is a file editing utility designed for the OpenCode ecosystem to provide safe, precise, and atomic file modifications through explicit patch operations. It prevents file corruption and accidental data loss by ensuring agents can only apply controlled, row-level edits, validated by cryptographic tokens based on file content (SHA-256 hashes). Text Patcher is implemented as a plugin/tool and exposes sub-tools (`text_read` and `text_patch`) for all file operations.

## Purpose

The primary goal of Text Patcher is to solve the problem of agents or scripts incorrectly updating files — whether by unintentionally replacing entire file contents or modifying the wrong sections. It leverages a token-based integrity system using file hashes to:

- Prevent stale or out-of-date patches following external file changes
- Ensure that file modifications are performed on the correct file version
- Allow only validated, explicit patches — no broad blind writes
- Track precise row locations and row-level operations (insert, replace, delete)
- Make file changes atomic: All patches succeed together, or none do

By enforcing these constraints, Text Patcher reduces the risk of file corruption and makes agent-driven automation safe and predictable.

## Workflow

### Reading a File (`text_read`)

- Used to retrieve file content and a token (SHA-256 hash) representing the file's current state.
- Default returns first 40 rows (max 100 rows per call)
- Supports selecting rows with `offset`/`limit` or `start`/`end` (all 1-based, inclusive)
- Row numbers in output are zero-padded, 5 digits (e.g., `00001|Line content`)
- If the file does not exist, returns `token: null`

#### Example: Basic Read
```typescript
const result = await text_patcher_text_read({ filename: "/path/to/file.txt" })
// Returns first 40 rows by default
```
#### Example: With offset/limit
```typescript
const result = await text_patcher_text_read({ filename: "/path/to/file.txt", offset: 10, limit: 20 })
```
#### Example: With start/end
```typescript
const result = await text_patcher_text_read({ filename: "/path/to/file.txt", start: 10, end: 30 })
```
#### Example: Non-existent file
```typescript
const result = await text_patcher_text_read({ filename: "/path/to/doesnotexist.txt" })
// Returns token: null
```

##### Return example
```
---
filename: /path/to/file.txt
token: a3f5b8c9d2e1...
offset: 10
limit: 5
---
00010|import { something } from 'somewhere'
00011|
00012|function example() {
...
```

### Patching a File (`text_patch`)

- Updates file content by applying one or more patch operations
- Requires a valid `token` (from `text_read`). If token is `null`, the tool will create a new file.
- Patches are arrays of objects specifying `offset`/`limit` and replacement `rows`
- All offsets and row references apply to the original file content (not earlier patch results)
- Patches are sorted by offset and applied sequentially with shift adjustment
- If the file has changed since token was generated, patching is rejected (atomicity and safety)

#### Example: Single patch
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
    }
  ]
}
const result = await text_patcher_text_patch(patch)
```

#### Example: Multiple patches
```typescript
const patch = {
  filename: "/path/to/file.txt",
  token: "a3f5b8c9d2e1...",
  patches: [
    {
      offset: 5,
      limit: 6,
      rows: []
    },
    {
      offset: 15,
      limit: 2,
      rows: ["// Inserted", "const x = 1;"]
    }
  ]
}
const result = await text_patcher_text_patch(patch)
```

#### Example: Create a new file
```typescript
const readResult = await text_patcher_text_read({ filename: "/path/to/new.txt" })
// token: null
const patch = {
  filename: "/path/to/new.txt",
  token: null,
  patches: [{ offset: 1, limit: 0, rows: ["const a = 1;", "console.log(a);"] }]
}
const result = await text_patcher_text_patch(patch)
```

#### Example: Delete operation (empty rows)
```typescript
const patch = {
  filename: "/path/to/file.txt",
  token: "a3f5b8c9d2e1...",
  patches: [
    { offset: 3, limit: 2, rows: [] } // Deletes rows 3 and 4
  ]
}
```

#### Example: Insert at beginning (limit: 0)
```typescript
{
  "offset": 1,
  "limit": 0,
  "rows": ["// Inserted at start"]
}
```

### Result Format
All patch operations return JSON:
- On success: `{ success: true, message: "Patches applied successfully" }`
- On error: `{ success: false, error: "<Description>" }`


## Tool Reference

### text_read
| Parameter    | Type    | Description                                                 |
|--------------|---------|-------------------------------------------------------------|
| filename     | string  | Path to the file                                            |
| offset       | number  | (Optional) Row to start reading from (1-based)              |
| limit        | number  | (Optional) Number of rows to read (max 100)                 |
| start        | number  | (Optional) Start row (1-based, inclusive)                   |
| end          | number  | (Optional) End row (1-based, inclusive)                     |

**Return:** YAML frontmatter with file metadata, then lines of content with 5-digit numbers.
- `token`: SHA-256 hash of file state or `null` if file does not exist.

### text_patch
| Parameter | Type              | Description                                        |
|-----------|-------------------|----------------------------------------------------|
| filename  | string            | Path to file                                       |
| token     | string \| null    | Token from `text_read` or `null` for new files     |
| patches   | Array<Patch>      | Sequence of patch operations (see below)           |

**Patch object:**
| Field  | Type        | Description                                 |
|--------|-------------|---------------------------------------------|
| offset | number      | 1-based original row # to patch (from read) |
| limit  | number      | Number of rows to replace/delete            |
| rows   | string[]    | Replacement/inserted lines (can be empty)   |

**Return:** JSON object indicating success or error, with a detailed message.

## Examples

### Reading a file (default 40 rows)
```typescript
await text_patcher_text_read({ filename: '/path/foo.js' })
```

### Reading with offset/limit
```typescript
await text_patcher_text_read({ filename: '/path/foo.js', offset: 101, limit: 10 })
```

### Reading with start/end
```typescript
await text_patcher_text_read({ filename: '/path/foo.js', start: 10, end: 30 })
```

### Reading a non-existent file
```typescript
await text_patcher_text_read({ filename: '/does/not/exist.txt' })
// Returns token: null
```

### Patching a file (single patch)
```typescript
await text_patcher_text_patch({
  filename: '/path/foo.js',
  token: '<sha-from-last-read>',
  patches: [
    { offset: 5, limit: 2, rows: ['// Updated', 'let a = 2;'] }
  ]
})
```

### Patching a file (multiple patches)
```typescript
await text_patcher_text_patch({
  filename: '/path/foo.js',
  token: '<sha-from-last-read>',
  patches: [
    { offset: 1, limit: 1, rows: ['// Header inserted'] },
    { offset: 10, limit: 0, rows: ['// Inserted before line 10'] }
  ]
})
```

### Creating a new file with token: null
```typescript
await text_patcher_text_patch({
  filename: '/path/new.js',
  token: null,
  patches: [
    { offset: 1, limit: 0, rows: ["const v = 0;", "console.log(v);"] }
  ]
})
```

### Deleting rows with empty rows array
```typescript
await text_patcher_text_patch({
  filename: '/path/foo.js',
  token: '<sha>',
  patches: [{ offset: 5, limit: 2, rows: [] }]
})
```

### Inserting rows (limit: 0)
```typescript
await text_patcher_text_patch({
  filename: '/path/foo.js',
  token: '<sha>',
  patches: [{ offset: 1, limit: 0, rows: ['// Insert first'] }]
})
```

## Key Concepts

- **SHA-256 Token Integrity**: Each file read returns a token (SHA-256 hash of the file). All patch operations require this token to verify no changes have occurred since the read.
- **1-Based Row Numbering**: All rows are numbered from 1 for readability. Patch offsets and frontmatter match this numbering.
- **Original Row Referencing**: All patches reference rows as they existed in the `text_read` output. Changes to row locations during patch application are handled internally by the tool.
- **Patch Sorting**: Patches are sorted by `offset` in ascending order. Patch application tracks and accounts for row-shift as modifications accumulate.
- **Cumulative Shift Tracking**: The net change in row count is used to correctly apply subsequent patches after insertion or deletion.
- **Overlap Detection**: Patches with overlapping offset/limit ranges (on the original file) are rejected to prevent data ambiguity/corruption.

## Best Practices

- Always read the file just before creating a patch to avoid SHA mismatches.
- Reference the original row numbers from your `text_read` when generating patches.
- For inserting at the top, use offset 1 and limit 0.
- For deleting, specify a `rows: []` (empty array).
- Do not combine overlapping patches in one operation.
- Do not edit large files in a single operation; use paging (max 100 rows per read).
- When creating new files, supply `token: null` and start with offset 1, limit 0.

## Limitations

- Does **not** support binary files or non-UTF8 data.
- Not designed for very large files in a streaming or chunked way (loads all read rows in memory).
- Current version does **not** support multi-user editing, concurrent patching, or built-in conflict resolution.
- No automatic undo/redo, backup, or versioning — ensure you backup files using external tooling as needed.

---

For full API detail and implementation rules, see `/Users/chad/.config/opencode/tool/text-patcher_spec.md`.