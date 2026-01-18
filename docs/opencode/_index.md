# OpenCode Documentation Index

This index lists all documentation files in the `docs/opencode` directory, with a
short summary and guidance on when each should be updated.

---

## Table of Contents

- [AGENTS.md](AGENTS.md)
- [agent-settings.md](agent-settings.md)
- [agents.md](agents.md)
- [building-skills.md](building-skills.md)
- [built-in-tool-todo.md](built-in-tool-todo.md)
- [builtin-tools.md](builtin-tools.md)
- [code-standards.md](code-standards.md)
- [commands.md](commands.md)
- [custom-tools.md](custom-tools.md)
- [mcp-servers.md](mcp-servers.md)
- [ollama.md](ollama.md)
- [opencode-cli.md](opencode-cli.md)
- [permissions.md](permissions.md)
- [plugins.md](plugins.md)
- [themes.md](themes.md)
- [tools.md](tools.md)
- [_index.md](_index.md)

---

## Document Summaries

### [AGENTS.md](AGENTS.md)

**Summary:** Instructions for agents working in the docs/opencode directory,
outlining the responsibility to keep _index.md up-to-date when adding, removing,
renaming, or modifying documentation files. Includes formatting guidelines,
workflow examples, and verification checklist.

**When to update:** Update when the index maintenance workflow changes, new
responsibilities are added, or formatting guidelines are modified.

---

### [agent-settings.md](agent-settings.md)

**Summary:** Comprehensive guide to agent frontmatter configuration, including basic
settings (description, mode, model), permission system, command-specific permissions,
and migration guide from legacy `tools` to `permission` configuration.

**When to update:** Update when agent configuration options change, new frontmatter
fields are added, or permission patterns are updated. Revise when migration guidance
or best practices change.

---

### [agents.md](agents.md)

**Summary:** Describes OpenCode's agent system, including primary agents
(orchestrators) and subagents (specialized tasks). Explains agent capabilities,
configuration, usage patterns, and best practices for invoking and creating agents.

**When to update:** Update when adding, removing, or changing agent types,
capabilities, or configuration patterns. Revise when agent best practices or
invocation syntax changes.

---

### [building-skills.md](building-skills.md)

**Summary:** Guide to creating and managing agent skills via SKILL.md definitions,
including file placement, discovery, frontmatter structure, permissions, and
troubleshooting. Covers both OpenCode and Claude-compatible skill locations.

**When to update:** Update when skill file structure, frontmatter fields, or
discovery mechanisms change. Revise if permission patterns or troubleshooting steps
are updated.

---

### [built-in-tool-todo.md](built-in-tool-todo.md)

**Summary:** Documentation for the built-in TODO tool, covering todoread and
todowrite functions, task states, priorities, and usage patterns for tracking
multi-step tasks during coding sessions.

**When to update:** Update when TODO tool functions, task states, or usage patterns
change. Revise if new features or best practices are added.

---

### [builtin-tools.md](builtin-tools.md)

**Summary:** Documents all built-in tool calls available in OpenCode, with
descriptions, parameters, and usage notes for each tool.

**When to update:** Update when new built-in tools are added, removed, or their APIs
change. Revise if tool usage patterns or parameter requirements are updated.

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
servers, configuration options, caveats, and integration with OpenCode's permission
system.

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

### [permissions.md](permissions.md)

**Summary:** Comprehensive guide to the permission system introduced in v1.1.1,
covering permission actions (allow/ask/deny), configuration patterns, global vs
per-agent settings, and the deprecation of legacy `tools` configuration.

**When to update:** Update when permission actions, configuration patterns, or
available permissions change. Revise if new permission types or best practices are
added.

---

### [plugins.md](plugins.md)

**Summary:** Guide to creating OpenCode plugins, including structure, lifecycle,
event hooks, custom tool registration, and extending agent behavior via TypeScript.

**When to update:** Update when plugin API, event hooks, or lifecycle methods change.
Revise if new plugin capabilities or best practices are introduced.

---

### [themes.md](themes.md)

**Summary:** Guide to selecting, customizing, and managing themes in OpenCode,
including terminal requirements, built-in themes, and custom theme creation.

**When to update:** Update when new themes are added, theme configuration changes, or
terminal requirements are updated. Revise if new customization options or best
practices are introduced.

---

### [tools.md](tools.md)

**Summary:** Overview of tool management in OpenCode using the permission system,
including configuration, enabling/disabling tools, built-in vs custom tools, and
integration with MCP servers. Includes migration notes from legacy `tools` config.

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
