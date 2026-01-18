---
created: 2026-01-10T17:07:55 (UTC -06:00)
tags: []
source: https://opencode.ai/docs/skills/
author:
---

# Agent Skills | OpenCode

> ## Excerpt
>
> Define reusable behavior via SKILL.md definitions

---

Define reusable behavior via SKILL.md definitions

Agent skills let OpenCode discover reusable instructions from your repo or home
directory. Skills are loaded on-demand via the native `skill` tool—agents see
available skills and can load the full content when needed.

---

## [Place files](https://opencode.ai/docs/skills/#place-files)

Create one folder per skill name and put a `SKILL.md` inside it. OpenCode searches
these locations:

- Project config: `.opencode/skill/<name>/SKILL.md`
- Global config: `~/.config/opencode/skill/<name>/SKILL.md`
- Project Claude-compatible: `.claude/skills/<name>/SKILL.md`
- Global Claude-compatible: `~/.claude/skills/<name>/SKILL.md`

---

## [Understand discovery](https://opencode.ai/docs/skills/#understand-discovery)

For project-local paths, OpenCode walks up from your current working directory until
it reaches the git worktree. It loads any matching `skill/*/SKILL.md` in `.opencode/`
and any matching `.claude/skills/*/SKILL.md` along the way.

Global definitions are also loaded from `~/.config/opencode/skill/*/SKILL.md` and
`~/.claude/skills/*/SKILL.md`.

---

## [Write frontmatter](https://opencode.ai/docs/skills/#write-frontmatter)

Each `SKILL.md` must start with YAML frontmatter. Only these fields are recognized:

- `name` (required)
- `description` (required)
- `license` (optional)
- `compatibility` (optional)
- `metadata` (optional, string-to-string map)

Unknown frontmatter fields are ignored.

---

## [Validate names](https://opencode.ai/docs/skills/#validate-names)

`name` must:

- Be 1–64 characters
- Be lowercase alphanumeric with single hyphen separators
- Not start or end with `-`
- Not contain consecutive `--`
- Match the directory name that contains `SKILL.md`

Equivalent regex:

---

## [Follow length rules](https://opencode.ai/docs/skills/#follow-length-rules)

`description` must be 1-1024 characters. Keep it specific enough for the agent to
choose correctly.

---

## [Use an example](https://opencode.ai/docs/skills/#use-an-example)

Create `.opencode/skill/git-release/SKILL.md` like this:

```yaml
---
name: git-release
description: Create consistent releases and changelogs
license: MIT
compatibility: opencode
metadata:
  audience: maintainers
  workflow: github
---
## What I do
- Draft release notes from merged PRs
- Propose a version bump
- Provide a copy-pasteable `gh release create` command

## When to use me
Use this when you are preparing a tagged release.
Ask clarifying questions if the target versioning scheme is unclear.
```

---

OpenCode lists available skills in the `skill` tool description. Each entry includes
the skill name and description:

```xml
<available_skills>
  <skill>
    <name>git-release</name>
    <description>Create consistent releases and changelogs</description>
  </skill>
</available_skills>
```

The agent loads a skill by calling the tool:

```javascript
skill({ name: "git-release" })
```

---

## [Configure permissions](https://opencode.ai/docs/skills/#configure-permissions)

Control which skills agents can access using pattern-based permissions in
`opencode.json`:

```json
{
  "permission": {
    "skill": {
      "pr-review": "allow",
      "internal-*": "deny",
      "experimental-*": "ask",
      "*": "allow"
    }
  }
}
```

| Permission | Behavior                                  |
| ---------- | ----------------------------------------- |
| `allow`    | Skill loads immediately                   |
| `deny`     | Skill hidden from agent, access rejected  |
| `ask`      | User prompted for approval before loading |

Patterns support wildcards: `internal-*` matches `internal-docs`, `internal-tools`,
etc.

---

## [Override per agent](https://opencode.ai/docs/skills/#override-per-agent)

Give specific agents different permissions than the global defaults.

**For custom agents** (in agent frontmatter):

```yaml
---
permission:
  skill:
    "documents-*": "allow"
---
```

**For built-in agents** (in `opencode.json`):

```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": {
          "internal-*": "allow"
        }
      }
    }
  }
}
```

---

Completely disable skills for agents that shouldn't use them:

**For custom agents**:

```yaml
---
permission:
  skill: deny
---
```

**For built-in agents**:

```json
{
  "agent": {
    "plan": {
      "permission": {
        "skill": "deny"
      }
    }
  }
}
```

When disabled, the `<available_skills>` section is omitted entirely.

---

## [Troubleshoot loading](https://opencode.ai/docs/skills/#troubleshoot-loading)

If a skill does not show up:

1.  Verify `SKILL.md` is spelled in all caps
2.  Check that frontmatter includes `name` and `description`
3.  Ensure skill names are unique across all locations
4.  Check permissions—skills with `deny` are hidden from agents

