# Tools | opencode

> Manage the tools an LLM can use.

---

Tools allow the LLM to perform actions in your codebase. OpenCode comes with a set of
built-in tools, but you can extend it with custom tools or MCP servers. By default,
all tools are **enabled** and don't need permission to run. But you can configure
this and control the permissions through your config.

**Note:** As of OpenCode v1.1.1, the legacy `tools` configuration (using `true`/`false`)
has been deprecated and merged into the `permission` system. The `permission` system
provides finer-grained control with three levels: `"allow"`, `"ask"`, and `"deny"`.
This documentation reflects the current `permission`-based configuration.

IMPORTANT: _Tools_ is not to be confused with _custom tools_. Custom tools are
user-defined TypeScript modules that appear as additional tools along side of the
built-in tools.

---

## Configure

You can configure tool permissions globally or per agent. Agent-specific configs override
global settings. By default, all tools are set to `"allow"`. To change permissions, set
them to one of three values:

- `"allow"` — Allow without approval
- `"ask"` — Prompt for approval before execution
- `"deny"` — Deny access without approval

---

### Global

Control tool permissions globally using the `permission` option.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "write": "deny",
    "bash": "deny",
    "webfetch": "allow"
  }
}
```

You can also use wildcards to control multiple tools at once. For example, to deny
all tools from an MCP server:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "mymcp_*": "deny"
  }
}
```

---

### Per agent

Override global permission settings for specific agents using the `permission` config in
the agent definition.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "write": "allow",
    "bash": "allow"
  },
  "agent": {
    "plan": {
      "permission": {
        "write": "deny",
        "bash": "deny"
      }
    }
  }
}
```

For example, here the `plan` agent overrides the global config to deny `write` and
`bash` permissions.

You can also configure permissions for agents in Markdown:

```yaml
---
description: Read-only analysis agent
mode: subagent
permission:
  write: deny
  edit: deny
  bash: deny
---
Analyze code without making any modifications.
```

Learn more about configuring permissions per agent in the agents documentation.

---

## Built-in

Here are all the built-in tools available in OpenCode.

---

### bash

Execute shell commands in your project environment.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "bash": "allow"
  }
}
```

This tool allows the LLM to run terminal commands like `npm install`, `git status`,
or any other shell command.

---

### edit

Modify existing files using exact string replacements.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "edit": "allow"
  }
}
```

This tool performs precise edits to files by replacing exact text matches. It's the
primary way the LLM modifies code.

---

### write

Create new files or overwrite existing ones.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "write": "allow"
  }
}
```

Use this to allow the LLM to create new files. It will overwrite existing files if
they already exist.

---

### read

Read file contents from your codebase.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "read": "allow"
  }
}
```

This tool reads files and returns their contents. It supports reading specific line
ranges for large files.

---

### grep

Search file contents using regular expressions.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "grep": "allow"
  }
}
```

Fast content search across your codebase. Supports full regex syntax and file pattern
filtering.

---

### glob

Find files by pattern matching.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "glob": "allow"
  }
}
```

Search for files using glob patterns like `**/*.js` or `src/**/*.ts`. Returns
matching file paths sorted by modification time.

---

### list

List files and directories in a given path.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "list": "allow"
  }
}
```

This tool lists directory contents. It accepts glob patterns to filter results.

---

### patch

Apply patches to files.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "patch": "allow"
  }
}
```

This tool applies patch files to your codebase. Useful for applying diffs and patches
from various sources.

---

### todowrite

Manage todo lists during coding sessions.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "todowrite": "allow"
  }
}
```

Creates and updates task lists to track progress during complex operations. The LLM
uses this to organize multi-step tasks.

---

### todoread

Read existing todo lists.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "todoread": "allow"
  }
}
```

Reads the current todo list state. Used by the LLM to track what tasks are pending or
completed.

---

### webfetch

Fetch web content.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "webfetch": "allow"
  }
}
```

Allows the LLM to fetch and read web pages. Useful for looking up documentation or
researching online resources.

---

### horology

Provides time-related functionality with human-readable formatted output.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "permission": {
    "horology": "allow"
  }
}
```

This tool provides the `get_current_date_and_time` function that returns the current
local date and time in a human-readable format. It takes no parameters and returns
the current local time formatted as:
`<day-of-week> the <day number><st|nd|rd|th> of <month>, <year> at <hour>:<min>:<sec>.<hundredths> <AM|PM>.`

**Example output:**

```
Sunday the 9th of November, 2025 at 3:45:12.34 PM.
```

---

Custom tools let you define your own functions that the LLM can call. These are
defined in your config file and can execute arbitrary code.

Learn more about creating custom tools in the custom tools documentation.

---

## MCP servers

MCP (Model Context Protocol) servers allow you to integrate external tools and
services. This includes database access, API integrations, and third-party services.

Learn more about configuring MCP servers in the MCP servers documentation.

---

## Internals

Internally, tools like `grep`, `glob`, and `list` use ripgrep under the hood. By
default, ripgrep respects `.gitignore` patterns, which means files and directories
listed in your `.gitignore` will be excluded from searches and listings.

---

### Ignore patterns

To include files that would normally be ignored, create a `.ignore` file in your
project root. This file can explicitly allow certain paths.

```ignore
!node_modules/
!dist/
!build/
```

For example, this `.ignore` file allows ripgrep to search within `node_modules/`,
`dist/`, and `build/` directories even if they're listed in `.gitignore`.
