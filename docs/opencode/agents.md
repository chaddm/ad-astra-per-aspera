# AGENTS.md

## Documentation Index Maintenance

This directory contains technical documentation for OpenCode. The `_index.md` file serves as a comprehensive index of all documentation files in this directory.

---

## Agent Responsibilities

When working in the `docs/opencode/` directory, agents are responsible for:

### 1. Keep `_index.md` Updated

Whenever you add, remove, rename, or significantly modify a documentation file in this directory, you **must** update `_index.md` to reflect those changes.

### 2. Required Updates

Update `_index.md` when:

- **Adding a new file**: Add an entry to both the Table of Contents and Document Summaries sections
- **Removing a file**: Remove the entry from both sections
- **Renaming a file**: Update the filename in both sections
- **Changing file purpose**: Update the summary and "When to update" guidance

### 3. Index Structure

The `_index.md` file has two main sections:

1. **Table of Contents** - Alphabetically ordered list of all `.md` files
2. **Document Summaries** - Detailed entry for each file containing:
   - File name (as heading link)
   - Summary paragraph describing the content
   - "When to update" guidance for future maintainers

### 4. Formatting Guidelines

- Keep files in **alphabetical order** in both sections
- Use consistent markdown formatting
- Keep summaries concise but descriptive (2-3 sentences)
- Provide clear "When to update" guidance
- Use relative links: `[filename.md](filename.md)`

---

## Example Workflow

When adding a new file `example-feature.md`:

1. Create the file with content
2. Open `_index.md`
3. Add to Table of Contents in alphabetical position: `- [example-feature.md](example-feature.md)`
4. Add to Document Summaries section in alphabetical position:

```markdown
### [example-feature.md](example-feature.md)

**Summary:** Brief description of what this file documents (2-3 sentences).

**When to update:** Guidance on when this file should be revised.

---
```

5. Verify the index is properly formatted and all files are accounted for

---

## Verification

Before completing your task, verify:

- [ ] All existing `.md` files in the directory are listed in `_index.md`
- [ ] No non-existent files are listed
- [ ] Files are in alphabetical order in both sections
- [ ] Each file has both a Table of Contents entry and a Document Summary
- [ ] Formatting is consistent with existing entries

---

## Questions?

If you're unsure about how to categorize a new documentation file or what summary to write, read the file contents and provide a clear, concise description of its purpose and scope.
