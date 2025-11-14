# MCPs directory

This directory mirrors the user's `~/.opencode/docs/mcps/` storage for MCP markdowns.

Purpose
- Store one Markdown file per MCP server that documents connection parameters,
  switches, environment variables, and example invocations.

Location
- Canonical location: `~/.opencode/docs/mcps/`
- For local workspace reference and examples, these files live in `docs/mcps/` in
  this repository.

File naming
- Use slug-style filenames, e.g. `openai-mcp.md`, `example-mcp.md`.

Template and examples
- Each file should follow the template in `agent/mcp-builder.md`.

Usage
- The `mcp-builder` subagent reads/writes files in `~/.opencode/docs/mcps/`. When
  integrating with projects, it will propose changes and show diffs before writing.
