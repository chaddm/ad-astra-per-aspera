# Built-in Read/Write Tools in OpenCode

This document describes the interfaces and invocation patterns for all built-in tools available for reading, writing, editing, and patching files in OpenCode. It covers how to read files (with or without line numbers), read specific line ranges, overwrite files, perform find-and-replace, and apply patch files. All examples are based on actual tool usage and validated with test files.

---

## 1. Reading Files

### Tool: `functions.read`

- **Purpose:** Read a file from the filesystem.
- **Parameters:**
  - `filePath` (string, required): Absolute path to the file.
  - `limit` (number, optional): Number of lines to read (default: 2000).
  - `offset` (number, optional): Line number to start reading from (0-based).
- **Return:** File contents with line numbers in `cat -n` format (e.g., `00001| Line 1`).
- **Notes:** 
  - Always returns line numbers.
  - Useful for large files: use `offset` and `limit` to read specific ranges.

**Examples:**
```json
{
  "filePath": "/absolute/path/to/file.md"
}
```
_Reads the first 2000 lines._

```json
{
  "filePath": "/absolute/path/to/file.md",
  "offset": 100,
  "limit": 50
}
```
_Reads 50 lines starting from line 101._

---

## 2. Writing (Overwriting) Files

### Tool: `functions.write`

- **Purpose:** Write (create or overwrite) a file with specific contents.
- **Parameters:**
  - `filePath` (string, required): Absolute path to the file.
  - `content` (string, required): The full content to write.
- **Return:** No direct output; always read the file after writing to validate.
- **Notes:** 
  - Overwrites the file if it exists.
  - You must read the file first before writing to it.

**Example:**
```json
{
  "filePath": "/absolute/path/to/file.md",
  "content": "New file contents\nLine 2\nLine 3\n"
}
```

---

## 3. Find and Replace (Editing Files)

### Tool: `functions.edit`

- **Purpose:** Replace a string in a file (find and replace).
- **Parameters:**
  - `filePath` (string, required): Absolute path to the file.
  - `oldString` (string, required): The exact string to replace (must match file content exactly, including whitespace).
  - `newString` (string, required): The replacement string.
  - `replaceAll` (boolean, optional): If true, replaces all occurrences; otherwise, only the first.
- **Return:** No direct output; always read the file after editing to validate.
- **Notes:**
  - You must read the file first before editing.
  - If `oldString` is not unique and `replaceAll` is not set, the edit will fail.
  - If `oldString` is not found, the edit will fail.
  - For multiple occurrences, use `replaceAll: true`.

**Examples:**
```json
{
  "filePath": "/absolute/path/to/file.md",
  "oldString": "target string",
  "newString": "replacement string"
}
```
_Replaces the first occurrence._

```json
{
  "filePath": "/absolute/path/to/file.md",
  "oldString": "target string",
  "newString": "replacement string",
  "replaceAll": true
}
```
_Replaces all occurrences._

---

## 4. Patching Files

### Tool: `functions.patch`

- **Purpose:** Apply patch files (diffs) to your codebase.
- **Parameters:**
  - `patchFilePath` (string, required): Absolute path to the patch file (unified diff format).
- **Return:** No direct output; always read the file after patching to validate.
- **Notes:**
  - The patch file must be in unified diff format.
  - Useful for applying diffs and patches from various sources.
  - If the patch fails, check the format and file paths in the patch.

**Example:**
```json
{
  "patchFilePath": "/absolute/path/to/file.patch"
}
```

---

## 5. Patterns and Best Practices

- **Always read the file after any write, edit, or patch operation to confirm the change.**
- **For large files, use `offset` and `limit` to work with manageable chunks.**
- **For find-and-replace, ensure `oldString` is unique or use `replaceAll`.**
- **For patching, use the patch tool for unified diffs.**

---

## Summary Table

| Operation                | Tool            | Parameters/Pattern                                                                 | Notes                                      |
|--------------------------|-----------------|------------------------------------------------------------------------------------|--------------------------------------------|
| Read file                | `functions.read`| `filePath`, `limit?`, `offset?`                                                    | Returns numbered lines                     |
| Read file range          | `functions.read`| `filePath`, `offset`, `limit`                                                      | For large files                            |
| Overwrite file           | `functions.write`| `filePath`, `content`                                                              | Overwrites entire file                     |
| Find and replace         | `functions.edit`| `filePath`, `oldString`, `newString`, `replaceAll?`                                | Must read file first                       |
| Patch file (unified diff)| `functions.patch`| `patchFilePath`                                                                    | Applies patch file                         |
| Patch file (targeted)    | `functions.edit`| See above                                                                          | For single/multiple string replacements    |
| Patch file (full)        | `functions.write`| See above                                                                          | Overwrite with new content                 |

---

## Example: Full Workflow

1. **Read a file:**
   ```json
   { "filePath": "/path/to/file.md" }
   ```
2. **Read lines 100-120:**
   ```json
   { "filePath": "/path/to/file.md", "offset": 99, "limit": 21 }
   ```
3. **Overwrite file:**
   ```json
   { "filePath": "/path/to/file.md", "content": "New content\n" }
   ```
4. **Replace all occurrences of a string:**
   ```json
   { "filePath": "/path/to/file.md", "oldString": "foo", "newString": "bar", "replaceAll": true }
   ```
5. **Apply a unified diff patch:**
   ```json
   { "patchFilePath": "/path/to/file.patch" }
   ```

---

## Limitations

- Patch tool requires unified diff format.
- No direct row-based patching; use read/edit/write patterns.
- Always validate changes by reading the file after any operation.

---

**End of documentation.**
