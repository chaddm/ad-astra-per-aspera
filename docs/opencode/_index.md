# OpenCode Documentation Index

This index lists all documentation files in the `docs/opencode` directory, with a
short summary and guidance on when each should be updated.

---

## Table of Contents

- [agent-settings.md](agent-settings.md)
- [agents.md](agents.md)
- [available-agents.md](available-agents.md)
- [builtin-tools.md](builtin-tools.md)
- [built-in-read-write-tools.md](built-in-read-write-tools.md)
- [built-in-tool-todo.md](built-in-tool-todo.md)
- [code-standards.md](code-standards.md)
- [commands.md](commands.md)
- [custom-tools.md](custom-tools.md)
- [mcp-servers.md](mcp-servers.md)
- [ollama.md](ollama.md)
- [opencode-cli.md](opencode-cli.md)
- [plugins.md](plugins.md)
- [themes.md](themes.md)
- [text-patcher.md](text-patcher.md)
- [tools.md](tools.md)
- [_index.md](_index.md)

---

## Document Summaries

### [agent-settings.md](agent-settings.md)

**Summary:** Documentation for agent settings and configuration options available through frontmatter in agent markdown files. Covers description, mode, model, permissions, tools, and other customization options.

**When to update:** Update when new agent settings are added, existing settings change, or configuration patterns are updated. Revise if new examples or best practices for agent configuration are introduced.

---

### [agents.md](agents.md)

**Summary:** Describes OpenCode's agent system, including primary agents
(orchestrators) and subagents (specialized tasks). Explains agent capabilities,
configuration, usage patterns, and best practices for invoking and creating agents.

**When to update:** Update when adding, removing, or changing agent types,
capabilities, or configuration patterns. Revise when agent best practices or
invocation syntax changes.

---

### [available-agents.md](available-agents.md)

**Summary:** Lists all available subagents, their purposes, and usage notes. Provides
a quick reference for which agent to use for specific tasks.

**When to update:** Update when new subagents are added, removed, or their roles
change. Revise if agent usage recommendations or capabilities are updated.

---

### [builtin-tools.md](builtin-tools.md)

**Summary:** Documents all built-in tool calls available in OpenCode, with
descriptions, parameters, and usage notes for each tool.

**When to update:** Update when new built-in tools are added, removed, or their APIs
change. Revise if tool usage patterns or parameter requirements are updated.

---

### [built-in-read-write-tools.md](built-in-read-write-tools.md)

**Summary:** Comprehensive guide to all built-in tools for reading, writing, editing, and patching files in OpenCode. Covers functions.read, functions.write, functions.edit, functions.patch, and text-patcher tools with examples and usage patterns.

**When to update:** Update when new read/write tools are added, existing tool APIs change, or usage patterns are updated. Revise if new examples, workflows, or best practices are introduced.

---

### [built-in-tool-todo.md](built-in-tool-todo.md)

**Summary:** Documentation for the built-in TODO tool in OpenCode, which helps manage structured task lists for coding sessions. Covers todoread, todowrite, task states, priorities, and best practices.

**When to update:** Update when TODO tool features, task states, or management patterns change. Revise if new usage examples or best practices are introduced.

---

### [code-standards.md](code-standards.md)

**Summary:** Defines code standards and best practices for tools and libraries in
OpenCode, including documentation, TypeScript usage, and guard clauses.

**When to update:** Update when code style, documentation, or TypeScript standards
change. Revise if new best practices are adopted or deprecated.

---

### [commands.md](commands.md)

**Summary:** Guide to creating and managing custom commands in OpenCode, including
configuration, file structure, naming conventions, and best practices for command
files.

**When to update:** Update when command file formats, configuration options, or best
practices change. Revise if new command features or troubleshooting steps are added.

---

### [custom-tools.md](custom-tools.md)

**Summary:** Instructions for creating custom tools that the LLM can call, including
structure, location, argument validation, and best practices.

**When to update:** Update when the custom tool API, argument validation, or best
practices change. Revise if new tool creation patterns or templates are introduced.

---

### [mcp-servers.md](mcp-servers.md)

**Summary:** Explains how to add and manage local/remote MCP (Model Context Protocol)
servers, configuration options, caveats, and integration with OpenCode.

**When to update:** Update when MCP server configuration, supported options, or
integration patterns change. Revise if new MCP server types or best practices are
introduced.

---

### [ollama.md](ollama.md)

**Summary:** Guide to using Ollama for running and managing local AI models,
including installation, commands, configuration, and troubleshooting.

**When to update:** Update when Ollama features, commands, or configuration options
change. Revise if new troubleshooting steps or best practices are added.

---

### [opencode-cli.md](opencode-cli.md)

**Summary:** Reference for the OpenCode CLI, including installation, commands,
options, usage examples, and best practices for automation and scripting.

**When to update:** Update when CLI commands, options, or usage patterns change.
Revise if new workflows or troubleshooting steps are introduced.

---

### [plugins.md](plugins.md)

**Summary:** Guide to creating OpenCode plugins, including structure, lifecycle, event hooks, registration, and usage. Explains how to extend OpenCode with custom functionality through the plugin system.

**When to update:** Update when plugin API, lifecycle hooks, or registration patterns change. Revise if new plugin features, examples, or best practices are introduced.

---

### [themes.md](themes.md)

**Summary:** Guide to selecting, customizing, and managing themes in OpenCode,
including terminal requirements, built-in themes, and custom theme creation.

**When to update:** Update when new themes are added, theme configuration changes, or
terminal requirements are updated. Revise if new customization options or best
practices are introduced.

---

### [text-patcher.md](text-patcher.md)

**Summary:** Comprehensive documentation for the Text Patcher tool, which provides integrity-checked file reading and patching operations using SHA-256 tokens. Includes workflow, tool reference, examples, key concepts, and best practices.

**When to update:** Update when text-patcher tool features, APIs, or behavior changes. Revise if new examples, best practices, or troubleshooting steps are added.

---

### [tools.md](tools.md)

**Summary:** Overview of tool management in OpenCode, including configuration,
enabling/disabling tools, built-in vs custom tools, and integration with MCP servers.

**When to update:** Update when tool configuration options, built-in tool list, or
integration patterns change. Revise if new tool management best practices are
introduced.

---

### [_index.md](_index.md)

**Summary:** This index file. Lists all documentation files in `docs/opencode` with
summaries and update instructions.

**When to update:** Update whenever a new documentation file is added, removed, or
renamed in `docs/opencode`, or when summaries or update instructions for any file
change.
