Here are the available tool calls in this environment, with a short description and
key usage notes for each.

functions.webfetch
- Purpose: Fetch and convert a web page to text/markdown/html and extract information.
- Key params: { url: string, format: "text"|"markdown"|"html", timeout?: number }
- Notes: URL must be fully-formed (HTTP upgraded to HTTPS). Use when you need to
  read/analyze page content.

functions.glob
- Purpose: Fast file pattern matching (glob) across the workspace.
- Key params: { path?: string, pattern: string }
- Notes: Returns matching file paths sorted by modification time. Use for finding
  files by name patterns.

functions.grep
- Purpose: Search file contents with regular expressions.
- Key params: { pattern: string, include?: string, path?: string }
- Notes: Returns files with at least one match. Use for content searches (supports
  full regex).

functions.list
- Purpose: List files/directories in a path.
- Key params: { path?: string, ignore?: string[] }
- Notes: Path must be absolute if provided. Prefer glob/grep when you know patterns
  to search.

functions.read
- Purpose: Read a file from the filesystem.
- Key params: { filePath: string, limit?: number, offset?: number }
- Notes: filePath must be absolute. Reads up to 2000 lines by default, returns
  numbered lines.

functions.todowrite
- Purpose: Create/update a structured todo list for development tasks.
- Key params: { todos:  { content, id, priority, status }  }
- Notes: Use for multi-step or complex coding tasks; enforces task states and one
  in_progress at a time.

functions.todoread
- Purpose: Read the current todo list.
- Key params: none
- Notes: Use to inspect the active todo list.

functions.task
- Purpose: Launch a specialized sub-agent to perform multi-step or complex autonomous tasks.
- Key params: { description: string, prompt: string, subagent_type: string }
- Notes: Must select a subagent_type (e.g., general, read-file, web-search, git,
  etc.). Agent runs autonomously and returns a single message.

functions.opencode-cli
- Purpose: Get available models from opencode and format as a numbered markdown list.
- Key params: none
- Notes: Returns opencode model info.

functions.horology
- Purpose: Get current date/time as formatted string.
- Key params: none

functions.horology_formatCurrentDateTime
- Purpose: Get current date/time in a formatted string.
- Key params: none

functions.horology_getOrdinalSuffix
- Purpose: Get ordinal suffix for a date (e.g., "st", "nd", "th").
- Key params: none

functions.mcp-context7_resolve-library-id
- Purpose: Resolve a package/library name to a Context7-compatible library ID (required before fetching docs).
- Key params: { libraryName: string }
- Notes: Must be called before mcp-context7_get-library-docs unless user provides an
  exact Context7 ID.

functions.mcp-context7_get-library-docs
- Purpose: Fetch documentation for a Context7 library ID.
- Key params: { context7CompatibleLibraryID: string, tokens?: number, topic?: string }
- Notes: Requires a Context7-compatible library ID (from resolve-library-id).

multi_tool_use.parallel
- Purpose: Run multiple functions.* tools in parallel.
- Key params: { tool_uses:  { recipient_name: "functions.<name>", parameters: {...} }  }
- Notes: Only functions namespace tools allowed. Use to execute independent tool calls concurrently.