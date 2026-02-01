# OpenCode CLI Command Parameters

This is a comprehensive list of command-line parameters available for the OpenCode CLI tool. These parameters allow users to customize the behavior of the CLI for various tasks, including file operations, web fetching, task management, and more.

## Table of Contents

- [Main Command](#main-command)
- [Global Options](#global-options)
- [Commands](#commands)
  - [completion](#completion)
  - [acp](#acp)
  - [attach](#attach)
  - [run](#run)
  - [auth](#auth)
  - [agent](#agent)
  - [upgrade](#upgrade)
  - [uninstall](#uninstall)
  - [serve](#serve)
  - [web](#web)
  - [models](#models)
  - [stats](#stats)
  - [export](#export)
  - [import](#import)
  - [github](#github)
  - [pr](#pr)
  - [session](#session)

---

## Main Command

### `opencode [project]`

Start the OpenCode TUI (Text User Interface).

**Usage:**
```bash
opencode [project]
```

**Positionals:**
- `project` - Path to start OpenCode in (string, optional)

**Options:**
- `-h, --help` - Show help (boolean)
- `-v, --version` - Show version number (boolean)
- `--print-logs` - Print logs to stderr (boolean)
- `--log-level` - Log level (choices: "DEBUG", "INFO", "WARN", "ERROR")
- `--port` - Port to listen on (number, default: 0)
- `--hostname` - Hostname to listen on (string, default: "127.0.0.1")
- `--mdns` - Enable mDNS service discovery (defaults hostname to 0.0.0.0) (boolean, default: false)
- `--cors` - Additional domains to allow for CORS (array, default: [])
- `-m, --model` - Model to use in the format of provider/model (string)
- `-c, --continue` - Continue the last session (boolean)
- `-s, --session` - Session ID to continue (string)
- `--prompt` - Prompt to use (string)
- `--agent` - Agent to use (string)

---

## Global Options

These options are available for all commands:

- `-h, --help` - Show help
- `-v, --version` - Show version number
- `--print-logs` - Print logs to stderr
- `--log-level` - Log level (choices: "DEBUG", "INFO", "WARN", "ERROR")

---

## Commands

### completion

Generate shell completion script.

**Usage:**
```bash
opencode completion
```

**Description:**
Outputs a shell completion script for zsh. Installation: `opencode completion >> ~/.zshrc` or `opencode completion >> ~/.zprofile` on macOS.

---

### acp

Start ACP (Agent Client Protocol) server.

**Usage:**
```bash
opencode acp
```

**Options:**
- `--port` - Port to listen on (number, default: 0)
- `--hostname` - Hostname to listen on (string, default: "127.0.0.1")
- `--mdns` - Enable mDNS service discovery (defaults hostname to 0.0.0.0) (boolean, default: false)
- `--cors` - Additional domains to allow for CORS (array, default: [])
- `--cwd` - Working directory (string, default: current directory)

---

### attach

Attach to a running OpenCode server.

**Usage:**
```bash
opencode attach <url>
```

**Positionals:**
- `url` - Server URL (e.g., http://localhost:4096) (string, required)

**Options:**
- `--dir` - Directory to run in (string)
- `-s, --session` - Session ID to continue (string)

---

### run

Run OpenCode with a message (non-interactive mode).

**Usage:**
```bash
opencode run [message..]
```

**Positionals:**
- `message` - Message to send (array, default: [])

**Options:**
- `--command` - The command to run, use message for args (string)
- `-c, --continue` - Continue the last session (boolean)
- `-s, --session` - Session ID to continue (string)
- `--share` - Share the session (boolean)
- `-m, --model` - Model to use in the format of provider/model (string)
- `--agent` - Agent to use (string)
- `--format` - Format: default (formatted) or json (raw JSON events) (choices: "default", "json", default: "default")
- `-f, --file` - File(s) to attach to message (array)
- `--title` - Title for the session (uses truncated prompt if no value provided) (string)
- `--attach` - Attach to a running OpenCode server (e.g., http://localhost:4096) (string)
- `--port` - Port for the local server (defaults to random port if no value provided) (number)

---

### auth

Manage credentials for LLM providers.

**Usage:**
```bash
opencode auth <command>
```

#### Subcommands

##### `auth login [url]`

Log in to a provider.

**Usage:**
```bash
opencode auth login [url]
```

**Positionals:**
- `url` - OpenCode auth provider URL (string)

##### `auth logout`

Log out from a configured provider.

**Usage:**
```bash
opencode auth logout
```

##### `auth list`

List providers (aliases: `ls`).

**Usage:**
```bash
opencode auth list
```

---

### agent

Manage agents.

**Usage:**
```bash
opencode agent <command>
```

#### Subcommands

##### `agent create`

Create a new agent.

**Usage:**
```bash
opencode agent create
```

**Options:**
- `--path` - Directory path to generate the agent file (string)
- `--description` - What the agent should do (string)
- `--mode` - Agent mode (choices: "all", "primary", "subagent")
- `--tools` - Comma-separated list of tools to enable (default: all). Available: "bash, read, write, edit, list, glob, grep, webfetch, task, todowrite, todoread" (string)
- `-m, --model` - Model to use in the format of provider/model (string)

##### `agent list`

List all available agents.

**Usage:**
```bash
opencode agent list
```

---

### upgrade

Upgrade OpenCode to the latest or a specific version.

**Usage:**
```bash
opencode upgrade [target]
```

**Positionals:**
- `target` - Version to upgrade to (e.g., '0.1.48' or 'v0.1.48') (string)

**Options:**
- `-m, --method` - Installation method to use (choices: "curl", "npm", "pnpm", "bun", "brew")

---

### uninstall

Uninstall OpenCode and remove all related files.

**Usage:**
```bash
opencode uninstall
```

**Options:**
- `-c, --keep-config` - Keep configuration files (boolean, default: false)
- `-d, --keep-data` - Keep session data and snapshots (boolean, default: false)
- `--dry-run` - Show what would be removed without removing (boolean, default: false)
- `-f, --force` - Skip confirmation prompts (boolean, default: false)

---

### serve

Start a headless OpenCode server.

**Usage:**
```bash
opencode serve
```

**Options:**
- `--port` - Port to listen on (number, default: 0)
- `--hostname` - Hostname to listen on (string, default: "127.0.0.1")
- `--mdns` - Enable mDNS service discovery (defaults hostname to 0.0.0.0) (boolean, default: false)
- `--cors` - Additional domains to allow for CORS (array, default: [])

---

### web

Start a headless OpenCode server (alias for `serve`).

**Usage:**
```bash
opencode web
```

**Options:**
- `--port` - Port to listen on (number, default: 0)
- `--hostname` - Hostname to listen on (string, default: "127.0.0.1")
- `--mdns` - Enable mDNS service discovery (defaults hostname to 0.0.0.0) (boolean, default: false)
- `--cors` - Additional domains to allow for CORS (array, default: [])

---

### models

List all available models.

**Usage:**
```bash
opencode models [provider]
```

**Positionals:**
- `provider` - Provider ID to filter models by (string)

**Options:**
- `--verbose` - Use more verbose model output (includes metadata like costs) (boolean)
- `--refresh` - Refresh the models cache from models.dev (boolean)

---

### stats

Show token usage and cost statistics.

**Usage:**
```bash
opencode stats
```

**Options:**
- `--days` - Show stats for the last N days (default: all time) (number)
- `--tools` - Number of tools to show (default: all) (number)
- `--models` - Show model statistics (default: hidden). Pass a number to show top N, otherwise shows all
- `--project` - Filter by project (default: all projects, empty string: current project) (string)

---

### export

Export session data as JSON.

**Usage:**
```bash
opencode export [sessionID]
```

**Positionals:**
- `sessionID` - Session ID to export (string)

---

### import

Import session data from JSON file or URL.

**Usage:**
```bash
opencode import <file>
```

**Positionals:**
- `file` - Path to JSON file or opencode.ai share URL (string, required)

---

### github

Manage GitHub agent.

**Usage:**
```bash
opencode github <command>
```

#### Subcommands

##### `github install`

Install the GitHub agent.

**Usage:**
```bash
opencode github install
```

##### `github run`

Run the GitHub agent.

**Usage:**
```bash
opencode github run
```

**Options:**
- `--event` - GitHub mock event to run the agent for (string)
- `--token` - GitHub personal access token (github_pat_********) (string)

---

### pr

Fetch and checkout a GitHub PR branch, then run OpenCode.

**Usage:**
```bash
opencode pr <number>
```

**Positionals:**
- `number` - PR number to checkout (number, required)

---

### session

Manage sessions.

**Usage:**
```bash
opencode session <command>
```

#### Subcommands

##### `session list`

List sessions.

**Usage:**
```bash
opencode session list
```

**Options:**
- `-n, --max-count` - Limit to N most recent sessions (number)
- `--format` - Output format (choices: "table", "json", default: "table")

---

## Examples

### Start OpenCode in a specific directory
```bash
opencode /path/to/project
```

### Run OpenCode with a message
```bash
opencode run "Explain the main function in src/index.js"
```

### List all available models for a provider
```bash
opencode models anthropic
```

### Show usage statistics for the last 7 days
```bash
opencode stats --days 7
```

### Create a new agent
```bash
opencode agent create --description "Review code for security issues" --mode subagent
```

### Export a session
```bash
opencode export ses_abc123
```

### Checkout and work on a PR
```bash
opencode pr 42
```
