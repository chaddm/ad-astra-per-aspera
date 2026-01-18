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

## Migrating from Legacy `tools` Configuration

**Note:** As of OpenCode v1.1.1, the legacy `tools` configuration has been deprecated and merged into the `permission` system. If you have existing agent frontmatter using the old `tools` syntax, follow this guide to migrate.

### Understanding the Changes

The old `tools` configuration used boolean values (`true`/`false`) to enable or disable tools:

**Old syntax (deprecated):**
```yaml
---
description: My agent
tools:
  write: false
  bash: false
  edit: true
  read: true
---
```

The new `permission` configuration uses three permission levels (`allow`, `ask`, `deny`) for finer-grained control:

**New syntax (current):**
```yaml
---
description: My agent
permission:
  write: deny
  bash: deny
  edit: allow
  read: allow
---
```

### Migration Rules

Use these mappings to convert old `tools` values to new `permission` values:

| Old `tools` Value | New `permission` Value | Behavior                        |
| ----------------- | ---------------------- | ------------------------------- |
| `true`            | `allow`                | Allow without approval          |
| `false`           | `deny`                 | Deny without approval           |
| (not specified)   | `ask`                  | Prompt for approval (optional)  |

### Migration Examples

#### Example 1: Read-Only Agent

**Before:**
```yaml
---
description: Read-only analysis agent
mode: subagent
tools:
  write: false
  edit: false
  bash: false
  read: true
  grep: true
  glob: true
---
```

**After:**
```yaml
---
description: Read-only analysis agent
mode: subagent
permission:
  write: deny
  edit: deny
  bash: deny
  read: allow
  grep: allow
  glob: allow
---
```

#### Example 2: Agent with Command Restrictions

**Before:**
```yaml
---
description: Git review agent
tools:
  bash: true
  write: false
  edit: false
---
```

**After (with enhanced control):**
```yaml
---
description: Git review agent
permission:
  bash:
    "git diff": allow
    "git log*": allow
    "git show*": allow
    "*": deny
  write: deny
  edit: deny
---
```

#### Example 3: Fully Enabled Agent

**Before:**
```yaml
---
description: Full access agent
tools:
  write: true
  edit: true
  bash: true
  read: true
---
```

**After:**
```yaml
---
description: Full access agent
permission:
  write: allow
  edit: allow
  bash: allow
  read: allow
---
```

### Quick Migration Steps

1. **Locate agent files**: Check both `.opencode/agent/*.md` and `~/.config/opencode/agent/*.md`

2. **Replace the key**: Change `tools:` to `permission:` in the frontmatter

3. **Update values**: Convert `true` → `allow` and `false` → `deny`

4. **Add granular controls** (optional): Take advantage of the new `ask` permission level or command-specific rules for `bash` and `skill`

5. **Test the agent**: Invoke the agent to ensure it behaves as expected with the new permissions

### Backward Compatibility

OpenCode v1.1.1+ still supports the old `tools` syntax for backward compatibility, but it's recommended to migrate to the new `permission` system to:

- Take advantage of the `ask` permission level for user-prompted approvals
- Use command-specific restrictions for `bash` and `skill` permissions
- Benefit from future enhancements to the permission system
- Keep your configuration aligned with current documentation
