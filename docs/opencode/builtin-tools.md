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

functions.text_patcher_text_read
- Purpose: Read a file with SHA-256 token and 1-based row numbering for integrity-checked editing.
- Key params: { filename: string, offset?: number, limit?: number, start?: number, end?: number }
- Notes: Returns YAML frontmatter with SHA token + numbered rows. Returns token: null for non-existent files. Default limit: 40, max: 100. Row numbers are 1-based (unlike functions.read). See docs/opencode/text-patcher.md for details.

functions.text_patcher_text_patch
- Purpose: Apply one or more row-based patches with SHA integrity verification (atomic operation).
- Key params: { filename: string, token: string | null, patches: Array<{ offset/limit OR start/end, rows: string[] }> }
- Notes: All patch offsets reference original row numbers from text_read. Patches sorted by offset before applying. Verifies SHA token matches file state. Can create new files with token: null. Empty rows array deletes rows. See docs/opencode/text-patcher.md for details.

functions.text_patcher
- Purpose: Default text-patcher tool (informational).
- Key params: none
- Notes: Returns description of text_read and text_patch sub-tools. Use sub-tools for actual operations.

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
- Notes: Must select a subagent_type (e.g., general, files-read, web-search, git,
  etc.). Agent runs autonomously and returns a single message.

functions.opencode-cli
- Purpose: Get available models from opencode and format as a numbered markdown list.
- Key params: none
- Notes: Returns opencode model info.

functions.horology
- Purpose: Get current date/time as formatted string.
- Key params: none

functions.is_leap_year
- Purpose: Returns true if the current year is a leap year, false otherwise.
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
