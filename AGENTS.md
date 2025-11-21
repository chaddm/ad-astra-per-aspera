# AGENTS.md

## Purpose

This directory serves as the global configuration directory for the `opencode`
open-source editor application.

Agents working in `~/.config/opencode/` directory are responsible for managing and
maintaining the global configuration files, adding or modifying agents and tools, and
ensuring the integrity of the `opencode` setup.

**IMPORTANT**: NEVER generate per-project-specific configuration files in
`~/.config/opencode/`.

## Agents

Immediately read `docs/agents.md` for a comprehensive overview of agents, their
types, and usage instructions. When possible, use subagents to handle specific tasks
or functionalities.

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

If you need more details about a specific agent or want to see usage examples, refer
to docs/agents.md or ask for more information.

### Available Documentation

This section provides a quick reference to the technical documentation available in
the `./docs/opencode` directory. Use these resources to understand and configure
various aspects of OpenCode.

1. **agents.md**

   - **Content**: Configure and use OpenCode's intelligent agents for specialized
     tasks. Explains primary agents (orchestrators) and subagents (specialized
     tasks), usage, and invocation.
   - **When to Read**: To learn about agent types, capabilities, and how to invoke or
     configure them.

2. **available-agents.md**

   - **Content**: Lists all available subagents, their purposes, and when to use
     each. Includes usage notes for each agent.
   - **When to Read**: For a comprehensive list of subagents, their roles, and best
     practices for delegation.

3. **builtin-tools.md**

   - **Content**: Describes all built-in tool calls, their purposes, parameters, and
     usage notes.
   - **When to Read**: To understand what built-in tools are available and how to use
     them in OpenCode.

4. **code-standards.md**

   - **Content**: Defines code standards and best practices for tools and libraries
     in OpenCode, including documentation, TypeScript usage, and guard clauses.
   - **When to Read**: When developing or reviewing code to ensure it meets project
     standards.

5. **commands.md**

   - **Content**: Guide to creating and managing custom commands in OpenCode,
     including configuration, file structure, and naming conventions.
   - **When to Read**: When you want to automate workflows or add custom commands to
     OpenCode.

6. **custom-tools.md**

   - **Content**: Instructions for creating custom tools that the LLM can call,
     including structure, location, and best practices.
   - **When to Read**: When you need to extend OpenCode with new tools or modify
     existing ones.

7. **mcp-servers.md**

   - **Content**: How to add and manage local/remote MCP (Model Context Protocol)
     servers, configuration, and caveats.
   - **When to Read**: When integrating external tools or services into OpenCode
     using MCP.

8. **ollama.md**

   - **Content**: Guide to using Ollama for running and managing local AI models,
     including installation, commands, and integration.
   - **When to Read**: When you want to run, manage, or integrate local AI models
     with OpenCode.

9. **opencode-cli.md**

   - **Content**: Complete reference for the OpenCode CLI, including installation,
     commands, options, and best practices.
   - **When to Read**: For CLI usage, automation, and scripting with OpenCode.

10. **themes.md**

    - **Content**: Guide to selecting, customizing, and managing themes in OpenCode,
      including terminal requirements and built-in themes.
    - **When to Read**: When you want to change or create themes for OpenCode.

11. **think.md**

    - **Content**: Describes the project orchestrator's role in OpenCode, focusing on
      analyzing prompts, breaking them into subagent tasks, and coordinating work.
      Emphasizes always using subagents for actions and provides guidance on
      responsibilities and best practices.
    - **When to Read**: When you want to understand or use the "think"
      features/agents and best practices for orchestrating work.

12. **tools.md**
    - **Content**: Overview of tool management in OpenCode, including configuration,
      enabling/disabling, and the difference between built-in and custom tools.
    - **When to Read**: When configuring or managing tools for agents in OpenCode.
