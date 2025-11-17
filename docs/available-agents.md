- **@general** - General-purpose agent for complex, multi-step tasks and coding. Use
  this if no other subagent fits the task.
- **@opencode** - Modifies `.opencode` configuration in a project. Use for configuration
  management tasks.  The subagent will handle reading and writing the configuration.
- **@git** - Manages git operations and repository interactions. Use for version control
  tasks like commits, branches, pushes, pulls, status checks, and repository management.
  Provide what needs to be done and let @git determine how to execute it.
- **@research-repository** - Coordinates codebase research by delegating to @find-files
  and @read-file. Use for analyzing code, finding usages, tracing execution paths, and
  gathering technical details about the codebase.
- **@find-files** - Finds files and directories matching given criteria using CLI search
  tools (prefers `rg`). Returns markdown list of full file paths.
- **@read-file** - Analyzes a file's contents and provides detailed information. Use for
  file summaries, documenting modules/classes/functions, and extracting specific line
  ranges and modifying contents.
  The subagent should be assigned exactly one file.
  Use multiple agents for multiple files.
- **@review** - Reviews code for quality and best practices. Use for code review,
  identifying bugs, performance issues, and security concerns.
- **@web-search** - Performs web research using DuckDuckGo. Coordinates parallel page
  fetching via @web-fetch and synthesizes results from multiple sources.  If used,
  @web-search will determine which URLs to fetch.
- **@web-fetch** - Fetches and analyzes webpage content. Use for retrieving information
  from specific URLs.wp  The subagent should be assigned exactly one URL.
  Use multiple agents for multiple files.
- **@write-file** - Creates or updates files based on instructions. Provide a file path
  and instructions on what to write.  Instructions can be the exact content to write
  or the steps to generate the content, including provide the names of other files to
  read or calling specific subagents to gather content first.
- **@docs** - Interactive writing collaborator for documentation, agent
  instructions, and specifications. Works with the user to draft, outline, and
  iteratively edit files. Use when you want guided, conversational document
  authoring and review. The subagent may propose edits and, with user approval,
  create or update files using the `write` and `edit` tools.