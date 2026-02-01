---
name: launch-opencode
description: Launch an instance of OpenCode in a specified directory, run a prompt using the task-runner agent, and return the result. Uses bash to execute the command.
license: MIT
compatibility: opencode
metadata:
---

## What I do

I launch an independent instance of OpenCode in a specified directory and run a prompt using the `task-runner` agent.  
This is useful for running OpenCode tasks non-interactively in a specific project directory.

## Parameters

| Name      | Type   | Required | Description                                                      |
|-----------|--------|----------|------------------------------------------------------------------|
| directory | string | Yes      | Path to the directory in which to launch and run OpenCode        |
| prompt    | string | Yes      | The prompt or instruction to be run by OpenCode with task-runner |

## Bash Usage Examples

### Example 1: Using `cd` and direct `opencode run`

```bash
cd /path/to/project && opencode run "Refactor utils for lodash compatibility." --agent=task-runner
```

### Example 2: Using `bash -c` for atomic execution

```bash
bash -c 'cd "/path/to/project" && opencode run "Build a summary of all recent issues." --agent=task-runner'
```

---

**Note:**  
- The agent determines the best method for invoking the shell (such as `bash -c`, direct process execution, or subprocess management).
- Ensure the `opencode` CLI is installed and accessible in the target environment.
- Always use proper shell quoting when your directory name or prompt string contains spaces or special characters.
