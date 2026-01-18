# AGENTS.md

## Project Information

This project is for managing the global configuration of OpenCode, an open-source
text-based UI application that leverages large language models (LLMs) to assist with
developer-related tasks, including code generation, refactoring, documentation, file
and directory management, project orchestration, etc.

OpenCode is extended by creating files in specific directories to define custom
tools, commands, and agents to fit specific workflows. This directory
(`~/.config/opencode/`) is the global configuration location for OpenCode. OpenCode
implements the following concepts:

**Agents** are modes of operation that provides specialized behavior. The agents are
defined in the `agent/` directory as markdown files. The configuration defines the
name, description, LLM model with LLM parameters, permissions and system prompt.
Information on modifying agents is found in `docs/opencode/agents.md`. Instructions
may be `delegated` to agents which will run in a separate context. This allows the
agent to focus on the specific task without being distracted by other context or
information.

> Important - When a task is delegated to an agent, the new agent is created with an
> new context loaded the agent's system prompt and the prompt provided. It will not
> have access to the previous context or conversation history. Use the instructions
> provided to provide the appropriate context for the delegated task. Finally, always
> validate delegated tasks with acceptance criteria to ensure the agent performs the
> task as expected.

**Commands** are custom instructions for specific tasks that can be invoked by the
user with a slash (ie `/my-command`). Commands are defined by markdown files in the
`command/` directory. Information on creating commands is found in
docs/opencode/commands.md`.

**Custom Tools** are JavaScript/TypeScript functions that can be invoked by agents to
perform programmatic tasks. Custom tools are defined in the `tool/` directory.
Information on developing custom tools is found in `docs/opencode/custom-tools.md`.
OpenCode uses the `bun` runtime and will include packages in the `package.json` file
for use in custom tools.

**Themes** define the appearance of OpenCode in the terminal. Themes are defined in
the `themes/` directory. Information on selecting or creating themes is found in
docs/opencode/themes.md`.

**Technical Documentation** is provided in the `docs/` directory. This includes
technical documentation for being able to develop agents, commands, and tools. When
developing agents, commands, custom tools, specification files, tests, themes, etc,
always read related technical documentation under the `docs/` directory.

Notable directories are:

- `docs/opencode`: Directory containing technical documentation related to OpenCode
  configuration, development, and usage, including agents, commands, tools, themes,
  MCP servers, and more. Important OpenCode documentation files include:
  - `docs/opencode/agents.md`: Development guide to agent creation and configuration.
  - `docs/opencode/commands.md`: Development guide to creating and managing custom
    commands in OpenCode.
  - `docs/opencode/custom-tools.md`: Development guide for custom tools.
- `docs/guides/`: Directory containing user guides and tutorials for specific
  libraries and CLI tools as reference when developing custom tools or instructions
  for agents calling shell commands. Important guide files include:
  - `docs/guides/code-best-practices.md`: Always read this guide when developing
    code.
  - `docs/guides/toon-format.md`: Always read this guide when required to work with
    TOON format input/output.
- `docs/mcps/`: Directory containing documentation related to Model Context Protocol
  (MCP) servers, including setup guides and usage instructions for integrating

## Subagents

The following agents are specifically defined for particular tasks and have
instructions for their use cases. Delegate tasks to these agents when appropriate.
Provide clear instructions for _what_ you want the agent to do. The agent will handle
_how_ to do it based on its capabilities, ie "download model <model-name>" or
"convert `<input_file>` to h264 format with 1080p as `<output_file>`". Request help
from the agent if you are unsure how to phrase your request.

### Subagents

#### Code & Repository Management

- **@files-manager**: Operates on files and directories within the project based on
  provided instructions. Cannot execute shell scripts.
  - See below.
- **@review**: Reviews code for quality and best practices (read-only, no direct
  changes).
- ## **@git-manager**: Executes git commands as a non-interactive git expert.

#### Research & Analysis

- **@research-repository**: Researches the codebase by coordinating file search and
  analysis.
- **@plan-sequence**: Given a plan, returns a markdown list of sequential actions by
  calling the sequential-thinking MCP.
- **@plan-goals**: Given a prompt, creates a plan and returns a markdown list of
  sequential actions.

#### Web & External Resources

- **@web-search**: Performs web research using DuckDuckGo and coordinates page
  fetching.
- **@web-fetch**: Fetches and analyzes webpage content. Returns a markdown version of
  the webpage with front-matter.

#### System & Package Management

- **@brew-manager**: Manages Homebrew package manager operations on macOS.
- **@video-encoder-manager**: Executes ffmpeg commands for video and audio
  processing.

#### Model & Service Management

- **@ollama-manager**: Manages Ollama models including downloading, deleting, and
  creating custom configurations.
- **@mcp-manager**: Model Context Protocol (MCP) configuration manager and curator.

---

You can invoke any of these agents directly using the @agent-name syntax, for
example:

```
@review Please review this code for security issues
@web-search Find documentation for React hooks
@ollama Download and set up the llama2 model
```

### Using the files-manager agent

The files-manager agent can be used to perform shell commands and file editing
functions.

> Important
>
> - Give only one command or file operation per delegation.
> - Give the agent instructions in the correct format for these operations to work
>   correctly.

**Shell Commands** - It can be passed exact commands for the following shell
commands: pwd, rm, chmod, chown, cp, file, mkdir, rmdir, and mv. When passing shell
commands, give the exact shell command.

Example: `mkdir -p foo/bar/baz`

**File Editing**

When using the files-manager to read/write file contents, use the following formats
for instructions. Never use more than one action at a time in the instructions.

1. Read file

Read all or part of a file. Useful finding parts of a file, by criteria.

Selection (optional): Return a subset of the rows from the file. All numbers 1-based.

- (Offset and Limit) or (Start Row and End Row). Line Number (optiona): Return line
  numbers with rows.

Examples:

```
Goal: Read file file and return markdown section label "Notes".
Filename: relative/path/to/file.md
Line numbers: true
```

```
Goal: Read file file and return selected rows.
Filename: relative/path/to/file.md
Offset: 9
Limit: 5
Line numbers: true
```

2. String Replacement

Find a specific string and replace the contents. Always read a file immediately
before making changes to validate row numbers.

```
Goal: Read file and replace string following colon with new contents after colon.  Strings are `\` escaped. Validate the file was updated.
Filename: relative/path/to/file.
All Occurrences: true
Current:<Exact string with no leading space and change returns to `\n`>
New:<Exact string with no leading space and change returns to `\n`>
```

3. Patch file

Provide a set of one or more row groups with new contents. Always read a file
immediately before making changes to validate row numbers.

```
Goal: Read file. From the following list of changes, generate a patch file and apply it.  Strings are `\` escaped.  Validate that the patch was applied.
Filename: <full relative or absolute path to file>
- Start: 9
  End: 12
  New Contents:<Exact string with no leading space and change returns to `\n`>
- Start: 40
  End: 40
  New Contents:<Exact string with no leading space and change returns to `\n`>
```

3. Replace file

Staring and ending lines are 1 based. Example:

```
Goal: Read the file then replace the contents file with what follows after the the `New Content:` line.  Validate that update was successfully written.
Filename: <full relative or absolute path to file>
New Contents:
<New contents without a trailing new line>
```

## Available Documentation

This section provides a quick reference to the technical documentation available in
the `./docs/opencode` directory.

Use these resources to understand and configure various aspects of OpenCode.

1. **docs/opencode/agents.md**
   - **Content**: Configure and use OpenCode's intelligent agents for specialized
     tasks. Explains primary agents (orchestrators) and subagents (specialized
     tasks), usage, and invocation.
   - **When to Read**: To learn about agent types, capabilities, and how to invoke or
     configure them.

2. **docs/opencode/available-agents.md**
   - **Content**: Lists all available subagents, their purposes, and when to use
     each. Includes usage notes for each agent.
   - **When to Read**: For a comprehensive list of subagents, their roles, and best
     practices for delegation.

3. **docs/opencode/builtin-tools.md**
   - **Content**: Describes all built-in tool calls, their purposes, parameters, and
     usage notes.
   - **When to Read**: To understand what built-in tools are available and how to use
     them in OpenCode.

4. **docs/opencode/code-standards.md**
   - **Content**: Defines code standards and best practices for tools and libraries
     in OpenCode, including documentation, TypeScript usage, and guard clauses.
   - **When to Read**: When developing or reviewing code to ensure it meets project
     standards.

5. **docs/opencode/commands.md**
   - **Content**: Guide to creating and managing custom commands in OpenCode,
     including configuration, file structure, and naming conventions.
   - **When to Read**: When you want to automate workflows or add custom commands to
     OpenCode.

6. **docs/opencode/custom-tools.md**
   - **Content**: Instructions for creating custom tools that the LLM can call,
     including structure, location, and best practices.
   - **When to Read**:
     - Need to create or modify OpenCode custom tools.
     - Work with code in the `tool/` directory.

7. **docs/opencode/mcp-servers.md**
   - **Content**: How to add and manage local/remote MCP (Model Context Protocol)
     servers, configuration, and caveats.
   - **When to Read**: When integrating external tools or services into OpenCode
     using MCP.

8. **docs/opencode/themes.md**
   - **Content**: Guide to selecting, customizing, and managing themes in OpenCode,
     including terminal requirements and built-in themes.
   - **When to Read**: When you want to change or create themes for OpenCode.

9. **docs/opencode/tools.md**
   - **Content**: Overview of tool management in OpenCode, including configuration,
     enabling/disabling, and the difference between built-in and custom tools.
   - **When to Read**: When configuring or managing tools for agents in OpenCode.
