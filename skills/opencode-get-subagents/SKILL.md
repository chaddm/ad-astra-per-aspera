---
name: opencode-get-subagents
description: Return information about available agents.
license: MIT
compatibility: opencode
metadata:
---

## What I do

This skill provides two scripts to retrieve agent information:

### Get All Subagents

Returns a list of all active subagents with basic information (name, description, purpose):

```
~/.config/opencode/skills/opencode-get-subagents/get-subagents
```

### Get Single Agent

Returns complete information for a specific agent (regardless of mode or active status):

```
~/.config/opencode/skills/opencode-get-subagents/get-subagent --name <agent-name>
```

## When to use me

- Use `get-subagents` when you need a list of available active subagents for delegation decisions
- Use `get-subagent` when you need detailed information about a specific agent's configuration

## Output Format

Both scripts return data in YAML format.

### get-subagents Output

Returns only active subagents with basic information:

```yaml
agents:
  - name: web-search
    description: Performs web research using DuckDuckGo and coordinates page fetching
    purpose:
      when-to-call: When you need to perform web research using DuckDuckGo and coordinate parallel page fetching
      active: true
  - name: files-manager
    description: Operates on files and directories within the project
    purpose:
      when-to-call: When you need to create, modify, or delete files and directories within the project
      active: true
```

**Properties returned:**
- `name` - Agent name (without .md extension)
- `description` - Agent description
- `purpose` - Object containing when-to-call and active status

### get-subagent Output

Returns complete frontmatter for a single agent (works for any agent, regardless of mode or active status):

```yaml
name: web-search
description: Performs web research using DuckDuckGo and coordinates page fetching
purpose:
  when-to-call: When you need to perform web research using DuckDuckGo and coordinate parallel page fetching
  active: true
mode: subagent
model: github-copilot/gpt-4.1
temperature: 0.4
permission:
  write: allow
  edit: allow
  bash: allow
  webfetch: deny
```

If agent does not exist:

```
Agent not found.
```

**Properties returned:**
- All frontmatter properties from the agent configuration file
- `name` - Agent name (without .md extension)

## Usage Examples

### List all active subagents

```bash
~/.config/opencode/skills/opencode-get-subagents/get-subagents
```

### Get details for a specific agent

```bash
~/.config/opencode/skills/opencode-get-subagents/get-subagent --name web-search
~/.config/opencode/skills/opencode-get-subagents/get-subagent --name files-manager
~/.config/opencode/skills/opencode-get-subagents/get-subagent --name orchestrator
```

### Handle non-existent agent

```bash
~/.config/opencode/skills/opencode-get-subagents/get-subagent --name does-not-exist
# Output: Agent not found.
```

## Filtering Logic (get-subagents only)

The `get-subagents` script only returns agents that meet ALL of the following criteria:

1. **Subagent Mode**: Has `mode: subagent` OR `type: subagent` in frontmatter
   - If neither `mode` nor `type` is specified, defaults to `primary` (excluded)
2. **Active Status**: Has `active: true` (defaults to `true` if not specified)
   - Checks `purpose.active` first, then top-level `active` property
   - Agents with explicit `active: false` or `purpose.active: false` are excluded

The `get-subagent` script returns ANY agent regardless of mode or active status.

## Notes

- `get-subagents` returns a filtered list with basic info (name, description, purpose)
- `get-subagent` returns complete details for a single agent (all frontmatter properties)
- Both scripts handle parsing errors gracefully
- Agent names are without the `.md` file extension
- Output format is clean YAML, easy to parse and read
