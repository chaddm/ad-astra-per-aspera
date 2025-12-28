# Agent Settings

Agents in OpenCode can be customized through frontmatter settings defined at the top
of the agent markdown file. These settings control various aspects of the agent's
behavior, including its description, mode, permissions, and available tools.

## Basic Settings

`description` - A brief description of the agent's purpose.

`mode` - The mode of the agent. Types are:

- `primary`: Drives high-level orchestration and delegates tasks to other.
- `subagent`: Does not appear in the user's agent list and is only invoked by primary
  agents.
- `all`: Appears in the user's agent list and can also be invoked by primary agents.

`model` - The LLM model to use for the agent. This can be any supported model. Common
models are:

- `github-copilot/gpt-4.1`
- `github-copilot/claude-sonnet-4.5`.

Model-specific parameters can be set using additional frontmatter settings. For
example:

`temperature` - The temperature setting for the LLM.

## Permissions

The `permission` control is for the built-in functionality that agents can access.
This includes file manipulation, shell command execution, web fetching, and more.
Permissions are defined under the `permission` frontmatter setting. Each permission
can be set to one of three values:

- `ask` — Prompt for approval.
- `allow` — Allow without approval.
- `deny` — Deny without approval.

**Available Permissions:**

- `external_directory` - Controls ability to access files outside the current working
  directory.
- `doom_loop` - Controls detection of potential infinite loops and terminates the
  agent.
- `edit` - Controls ability to modify a single file by string match-and-replace.
- `patch` - Controls ability to apply a difference patch which affect one or more
  files.
- `write` - Controls ability to create new and/or overwrite existing a single file.
- `bash` - Controls access to shell commands. Can be refined to specific command
  strings, includes support wildcards and catch-all rules.
- `webfetch` - Controls access to web operations. Note the following:
  - Supports HTTP and HTTPS.
  - Supports returning response as text, HTML, and Markdown formats.
  - Limited 5 MB per fetch.
  - Configurable timeout (default 10 seconds).
  - Does not support authentication.
- `skill` - Controls access to skills.

**Simple Example**

```
---
title: Agent Access
permission:
  external_directory: deny
  doom_loop: allow
  edit: deny
  patch: deny
  write: deny
  webfetch: deny
  bash: deny
  skill: deny
---

Provide a response for the user's question without making any changes to files or executing
commands.
```

### Specific Command Permissions

The `bash` and `skill` tools can restricted to specific commands by providing a
string. The string supports simple wildcards (`?` and `*`) to match a sequence of
characters. First matching line will be applied, which allows for "catch-all"
scenarios.

For example, to allow only `git diff` and `git log*` commands, you can configure the
permissions as follows:

```
---
description: Code review without edits
mode: subagent
permission:
  external_directory: deny
  doom_loop: allow
  edit: deny
  patch: deny
  write: deny
  webfetch: deny
  bash:
    "git diff": allow
    "git log*": allow
    "*": deny
  skill: deny
---

Return a code review of the current branch's changes in Markdown format.
```

## Tools

The `tool` control is for extensions to to the Opencode program, which includes
built-in extensions, custom tool extensions, and configured MCP services. Each
permission can be set to `true` or `false` to enable or disable the tool for the
agent. Built-in Opencode tools are listed by name:

- `bash` - Allows shell command execution.
- `edit` - Allows file editing by string match-and-replace.
- `write` - Allows file creation and overwriting.
- `read` - Allows file reading.
- `grep` - Allows searching file contents.
- `glob` - Allows searching for files and directories by pattern.
- `list` - Allows listing files and directories.
- `lsp` - Allows interaction with Language Server Protocol (LSP) services for code
  analysis and completion.
- `patch` - Allows applying difference patches to files.
- `skill` - Allows access to skills.

Custom tools and MCP services will be listed by their respective plugin name and
function name using underscores to separate words.

```
---
description: Code review without edits
mode: subagent
tools:
  bash: true
  edit: true
  write: true
  read: true
  grep: true
  glob: true
  list: true
  lsp: true
  patch: true
  skill: true
---
```

> Note: Unlike permissions, tools are enabled or disabled without granular control
> over specific commands or functions.
