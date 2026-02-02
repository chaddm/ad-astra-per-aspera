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
`docs/opencode/commands.md`.

**Custom Tools** are JavaScript/TypeScript functions that can be invoked by agents to
perform programmatic tasks. Custom tools are defined in the `tool/` directory.
Information on developing custom tools is found in `docs/opencode/custom-tools.md`.
OpenCode uses the `bun` runtime and will include packages in the `package.json` file
for use in custom tools.

**Themes** define the appearance of OpenCode in the terminal. Themes are defined in
the `themes/` directory. Information on selecting or creating themes is found in
`docs/opencode/themes.md`.

**Technical Documentation** is provided in the `docs/` directory. This includes
technical documentation for being able to develop agents, commands, and tools. When
developing agents, commands, custom tools, specification files, tests, themes, etc,
always read related technical documentation under the `docs/` directory.

---

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

## Specific Purpose Agents

The following agents are specifically defined for particular tasks and have
instructions for their use cases. Delegate tasks to these agents when appropriate.
Provide clear instructions for _what_ you want the agent to do. The agent will handle
_how_ to do it based on its capabilities, ie "download model <model-name>" or
"convert `<input_file>` to h264 format with 1080p as `<output_file>`". Request help
from the agent if you are unsure how to phrase your request.

### Subagents

#### Code & Repository Management

- **@opencode**: Modifies `.opencode` configuration files (both per-project and
  global).
- **@review**: Reviews code for quality and best practices (read-only, no direct
  changes).

#### Research & Analysis

- **@research-repository**: Performs codebase research and search operations.
- **@files-read**: Analyzes file contents, provides summaries, documents code, and
  extracts sections.
- **@deep-build**: Fully autonomous; plans and executes prompts end-to-end with no
  user interaction.
- **@plan-sequence**: Breaks down plans into actionable, sequential steps.
- **@plan-tractacus**: Decomposes prompts into plans and sequences using
  tractatus-thinking.

#### Web & External Resources

- **@web-search**: Performs web research using DuckDuckGo and coordinates parallel
  page fetching.
- **@web-fetch**: Fetches and analyzes specific webpage content. Returns a markdown
  version of the webpage with front-matter.

#### Development Tools

- **ffmpeg**: Handles video and audio processing tasks using ffmpeg, including format
  conversion, compression, and extraction.
- **git**: Manages git repositories, including cloning, branching, committing, and
  pushing changes.
- **@mcp-builder**: Builds and manages MCP (Model Context Protocol) servers and
  integrations.
- **ollama**: Manages the host's Ollama models, including downloading models,
  deleting models, and creating custom configurations.
- **@docker-manager**: Reports on and manages Docker containers, images, networks,
  volumes, and Docker Compose stacks. Unless specifically instructed, assume listing
  and manipulating stacks means using docker-manager.
- **@things3-manager**: Manages MacOS Things3 (aka "Things") application, a user task
  manager that manages tasks in groups of areas and projects. Can retrieve areas and
  projects with filtering, get detailed information on projects and to-dos, and
  update to-do properties.

---

You can invoke any of these agents directly using the @agent-name syntax, for
example:

```
@review Please review this code for security issues
@web-search Find documentation for React hooks
@ollama Download and set up the llama2 model
```

If you need more details about a specific agent or want to see usage examples, refer
to `docs/opencode/agents.md` or ask for more information.

### Available Documentation

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

## Available Tools

Built-in Tools

File Operations:

- read - Read file contents from filesystem
- write - Create new files or overwrite existing ones
- edit - Modify files using exact string replacements
- patch - Apply difference patches to files

Search & Discovery:

- grep - Search file contents with regex patterns
- glob - Find files by pattern matching (e.g., \*_/_.js)
- list - List files and directories in a path

Execution:

- bash - Execute shell commands in your environment

Task Management:

- todowrite - Create/update structured todo lists for tracking tasks
- todoread - Read the current todo list state

External:

- webfetch - Fetch and convert web pages to text/markdown/html
- skill - Access specialized skills

Utilities:

- horology - Get current date/time in human-readable format

Additional Tool Categories

MCP Tools (via Model Context Protocol servers):

- mcp-context7 - Resolve library IDs and query documentation
- Custom MCP servers can be added per project
