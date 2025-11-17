# AGENTS.md

## Purpose

This directory serves as the global configuration directory for the `opencode`
application. Agents working in `~/.config/opencode/` directory are responsible for
managing and maintaining the global configuration files, adding or modifying agents
and tools, and ensuring the integrity of the `opencode` setup.

**ALL AGENTS ARE GLOBAL**: NEVER generate per-project-specific configuration files
here.

## Agents

Immediately read `docs/agents.md` for a comprehensive overview of agents, their types,
and usage instructions.  When possible, use subagents to handle specific tasks or
functionalities.

## List of Agents

### Primary Agents
- **@vibe-kanban**: Manages kanbawhile reserving primary agents for overarching
  management andn boards and tasks using the vibe-kanban MCP API. Handles
  project/task management, automation, and kanban best practices.
- **@ask**: Project orchestrator that delegates tasks to specialized subagents in
  read-only mode.
- **@claud-think**: Project orchestrator that analyzes requests and delegates to
  subagents (does not implement directly).
- **@gpt-think**: Similar to @claud-think, orchestrates work by delegating to
  subagents.

### Subagents

#### Code & Repository Management
- **@opencode**: Modifies `.opencode` configuration files (both per-project and
  global).
- **@review**: Reviews code for quality and best practices (read-only, no direct
  changes).

#### Research & Analysis
- **@research-repository**: Coordinates codebase research by delegating to
  file-finding and reading subagents.
- **@read-file**: Analyzes file contents, provides summaries, documents code, and
  extracts sections.
- **@deep-plan**: Generates detailed, step-by-step action plans from prompts.
- **@deep-build**: Fully autonomous; plans and executes prompts end-to-end with no
  user interaction.
- **@plan-sequence**: Breaks down plans into actionable, sequential steps.
- **@plan-tractacus**: Decomposes prompts into plans and sequences using
  tractatus-thinking.

#### Web & External Resources
- **@web-search**: Performs web research using DuckDuckGo and coordinates parallel
  page fetching.
- **@web-fetch**: Fetches and analyzes specific webpage content.

#### Development Tools
- **@mcp-builder**: Builds and manages MCP (Model Context Protocol) servers and
  integrations.
- **@ollama**: Manages Ollama models and configurations (download, delete, info,
  create, etc.).
- **@git**: Executes git commands as a non-interactive git expert.
- **@write-file**: Creates, overwrites, or patches files as instructed.

---

You can invoke any of these agents directly using the @agent-name syntax, for
example:

```
@review Please review this code for security issues
@web-search Find documentation for React hooks
@ollama Download and set up the llama2 model
```

If you need more details about a specific agent or want to see usage examples, refer to docs/agents.md or ask for more information.


### Available Documentation

This section provides a quick reference to the technical documentation available in
the `docs` directory. Use these resources to understand and configure various aspects
of OpenCode.

1. **`agents.md`**:
   - **Content**: Overview of agents, their types (primary and subagents), and usage instructions.
   - **When to Read**: Refer to this file to learn about the different agents
     available in OpenCode, how to configure them, and their specific use cases.

2. **`tools.md`**:
   - **Content**: Guide to creating and managing custom tools that the LLM can call
     during conversations.
   - **When to Read**: Use this file when you need to define new tools or extend the
     functionality of OpenCode with custom logic.

3. **`mcp-servers.md`**:
   - **Content**: Instructions for adding and managing MCP (Model Context Protocol)
     servers, both local and remote.
   - **When to Read**: Consult this file when integrating external tools or services
     into OpenCode using MCP servers.

4. **`themes.md`**:
   - **Content**: Guide to selecting, customizing, and managing themes in OpenCode.
   - **When to Read**: Refer to this file to learn about built-in themes, creating
     custom themes, and ensuring compatibility with your terminal.

5. **`commands.md`**:
   - **Content**: Instructions for creating and managing custom commands that extend
     OpenCode's functionality through the command system.
   - **When to Read**: Consult this file when you need to create custom commands or
     modify existing commands in the `command/` directory.

6. **`opencode-cli.md`**:
   - **Content**: Complete reference guide for the OpenCode command-line interface,
     including all commands, options, switches, installation methods, usage examples,
     and best practices.
   - **When to Read**: Reference this file when you need to understand OpenCode CLI
     commands, set up installation, learn command-line options, or find examples for
     specific workflows and use cases.
