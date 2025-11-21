# OpenCode CLI Reference

## Introduction

OpenCode is an AI-powered coding assistant that provides an interactive command-line
interface for software development tasks. It leverages large language models to help
with code generation, debugging, refactoring, and other development workflows through
a powerful terminal-based user interface.  The tool can also be used in headless mode
for automation and scripting.

## Overview

OpenCode combines the power of AI with traditional development tools, offering:

- **Interactive TUI (Terminal User Interface)**: A rich, interactive interface for AI-assisted coding
- **Multi-provider AI support**: Works with various AI model providers
- **Agent system**: Specialized agents for different types of tasks
- **Session management**: Save and resume coding sessions
- **GitHub integration**: Direct integration with GitHub repositories
- **Extensible architecture**: Support for custom agents and tools

## Installation

OpenCode can be installed through multiple package managers:

```bash
# Using npm
npm install -g opencode

# Using pnpm
pnpm install -g opencode

# Using bun
bun install -g opencode

# Using Homebrew (macOS)
brew install opencode

# Using curl
curl -fsSL https://opencode.ai/install | sh
```

## Basic Usage

The basic syntax for OpenCode commands is:

```bash
opencode [command] [options] [arguments]
```

### Quick Start

```bash
# Start OpenCode in the current directory
opencode

# Start OpenCode in a specific project directory
opencode /path/to/project

# Run a quick command without entering the TUI
opencode run "fix the typescript errors in this project"

# Continue your last session
opencode --continue
```

## Commands

### Default Command (Interactive TUI)

```bash
opencode [project]
```

Starts the OpenCode Terminal User Interface (TUI) in interactive mode.

**Arguments:**
- `project` (optional): Path to the project directory to start OpenCode in

**Examples:**
```bash
# Start in current directory
opencode

# Start in specific project
opencode ~/projects/my-app

# Start in current directory with specific model
opencode --model anthropic/claude-3-sonnet
```

### `run` - Execute Single Command

```bash
opencode run [message..]
```

Executes a single command or prompt without entering the interactive TUI.

**Arguments:**
- `message..`: The prompt or command to execute

**Examples:**
```bash
# Fix TypeScript errors
opencode run "fix all typescript errors in this codebase"

# Generate documentation
opencode run "generate README documentation for this project"

# Code review
opencode run "review the code in src/components and suggest improvements"
```

### `attach` - Connect to Server

```bash
opencode attach <url>
```

Connects to a running OpenCode server instance.

**Arguments:**
- `url`: The URL of the running OpenCode server

**Examples:**
```bash
# Connect to local server
opencode attach http://localhost:3000

# Connect to remote server
opencode attach https://my-opencode-server.com
```

### `serve` - Start Headless Server

```bash
opencode serve
```

Starts OpenCode as a headless server that can be accessed remotely.

**Examples:**
```bash
# Start server on default port
opencode serve

# Start server on specific port and hostname
opencode serve --port 8080 --hostname 0.0.0.0
```

### `web` - Start Web Server

```bash
opencode web
```

Starts a web-based version of OpenCode that can be accessed through a browser.

### Authentication Commands

#### `auth` - Manage Credentials

```bash
opencode auth <subcommand>
```

**Subcommands:**

##### `login` - Log in to Provider
```bash
opencode auth login [url]
```

Authenticates with an AI model provider.

**Arguments:**
- `url` (optional): Custom provider URL

**Examples:**
```bash
# Login to default providers
opencode auth login

# Login to custom provider
opencode auth login https://api.custom-provider.com
```

##### `logout` - Log out from Provider
```bash
opencode auth logout
```

Logs out from the currently configured provider.

##### `list` - List Providers
```bash
opencode auth list
# or
opencode auth ls
```

Lists all configured authentication providers.

### Agent Management

#### `agent` - Manage Agents

```bash
opencode agent <subcommand>
```

**Subcommands:**

##### `create` - Create New Agent
```bash
opencode agent create
```

Creates a new custom agent with interactive prompts.

### GitHub Integration

#### `github` - GitHub Agent Management

```bash
opencode github <subcommand>
```

**Subcommands:**

##### `install` - Install GitHub Agent
```bash
opencode github install
```

Installs the GitHub agent for repository integration.

##### `run` - Run GitHub Agent
```bash
opencode github run
```

Executes the GitHub agent for repository operations.

### Utility Commands

#### `models` - List Available Models

```bash
opencode models
```

Lists all available AI models from configured providers.

#### `stats` - Usage Statistics

```bash
opencode stats
```

Shows token usage and cost statistics for your OpenCode sessions.

#### `export` - Export Session Data

```bash
opencode export [sessionID]
```

Exports session data as JSON format.

**Arguments:**
- `sessionID` (optional): Specific session ID to export. If omitted, exports the current/last session.

**Examples:**
```bash
# Export current session
opencode export

# Export specific session
opencode export abc123def456
```

#### `import` - Import Session Data

```bash
opencode import <file>
```

Imports session data from a JSON file or URL.

**Arguments:**
- `file`: Path to JSON file or URL containing session data

**Examples:**
```bash
# Import from local file
opencode import ./session-backup.json

# Import from URL
opencode import https://example.com/session-data.json
```

#### `upgrade` - Upgrade OpenCode

```bash
opencode upgrade [target]
```

Upgrades OpenCode to the latest version or a specific version.

**Arguments:**
- `target` (optional): Specific version to upgrade to (e.g., '0.1.48' or 'v0.1.48')

**Examples:**
```bash
# Upgrade to latest version
opencode upgrade

# Upgrade to specific version
opencode upgrade 0.1.48

# Upgrade using specific method
opencode upgrade --method brew
```

#### `acp` - Start ACP Server

```bash
opencode acp
```

Starts an Agent Client Protocol (ACP) server for agent communication.

## Global Options

The following options are available for most commands:

### Help and Version

- `-h, --help`: Show help information
- `-v, --version`: Show version number

### Logging Options

- `--print-logs`: Print logs to stderr
- `--log-level`: Set log level (choices: "DEBUG", "INFO", "WARN", "ERROR")

### Model and Session Options

- `-m, --model`: Specify model to use in the format `provider/model`
- `-c, --continue`: Continue the last session
- `-s, --session`: Specify session ID to continue
- `-p, --prompt`: Specify initial prompt to use
- `--agent`: Specify which agent to use

### Server Options

- `--port`: Port to listen on (default: 0 for auto-assign)
- `--hostname`: Hostname to listen on (default: "127.0.0.1")

## Usage Examples

### Common Development Workflows

#### 1. Code Review and Refactoring

```bash
# Start interactive session for code review
opencode --agent review

# Quick code review
opencode run "review this React component and suggest improvements"

# Refactor with specific focus
opencode run "refactor the authentication system to use TypeScript strict mode"
```

#### 2. Debugging and Error Fixing

```bash
# Fix compilation errors
opencode run "fix all TypeScript compilation errors"

# Debug runtime issues
opencode run "help me debug why the API calls are failing in production"

# Performance optimization
opencode run "analyze and optimize the performance bottlenecks in this codebase"
```

#### 3. Documentation and Testing

```bash
# Generate documentation
opencode run "generate comprehensive API documentation for all endpoints"

# Create tests
opencode run "write unit tests for the user authentication module"

# Update README
opencode run "update the README with installation and usage instructions"
```

#### 4. New Feature Development

```bash
# Start with specific model for complex tasks
opencode --model anthropic/claude-3-opus

# Plan feature implementation
opencode run "help me design and implement a user notification system"

# Continue previous session
opencode --continue
```

#### 5. Multi-Session Development

```bash
# Export current session for backup
opencode export > backup-session.json

# Continue specific session later
opencode --session abc123def456

# Import session from backup
opencode import backup-session.json
```

### Server and Remote Usage

#### 1. Team Collaboration

```bash
# Start server for team access
opencode serve --port 8080 --hostname 0.0.0.0

# Team member connects to server
opencode attach http://team-server:8080
```

#### 2. Remote Development

```bash
# Start web interface on server
opencode web --port 3000

# Access via browser at http://server:3000
```

### GitHub Integration

```bash
# Install GitHub agent
opencode github install

# Use GitHub agent for repository tasks
opencode github run

# Start with GitHub context
opencode --agent github
```

## Tips and Best practices

### 1. Model Selection

- Use `opencode models` to see available models
- Choose appropriate models for different tasks:
  - **Code generation**: Use larger models like GPT-4 or Claude-3-Opus
  - **Simple fixes**: Smaller models like GPT-3.5-turbo work well
  - **Code review**: Mid-size models offer good balance of speed and quality

```bash
# List available models
opencode models

# Use specific model for complex task
opencode --model anthropic/claude-3-opus run "architect a new microservice"
```

### 2. Session Management

- Use `--continue` to resume your last session
- Export important sessions for backup: `opencode export > important-session.json`
- Use descriptive session IDs when possible
- Regularly check usage with `opencode stats`

### 3. Agent Utilization

- Use specialized agents for specific tasks:
  - Review agent for code reviews
  - GitHub agent for repository operations
  - Custom agents for domain-specific tasks

```bash
# Create custom agent for your specific needs
opencode agent create

# Use specialized agent
opencode --agent review
```

### 4. Effective Prompting

- Be specific about what you want to achieve
- Provide context about your codebase and requirements
- Use iterative refinement with the `--continue` option
- Break complex tasks into smaller, manageable steps

### 5. Development Workflow Integration

```bash
# Add to your development aliases
alias oc="opencode"
alias ocr="opencode run"
alias occ="opencode --continue"

# Use in git hooks or CI/CD
opencode run "review this commit for potential issues"
```

### 6. Performance Optimization

- Use `--log-level ERROR` to reduce noise in production
- Set appropriate timeouts for long-running tasks
- Use local models when available for faster responses
- Cache frequently used sessions with export/import

### 7. Security Considerations

- Review authentication status regularly: `opencode auth list`
- Use appropriate log levels to avoid exposing sensitive information
- Be cautious when sharing exported session data
- Regularly upgrade to get security patches: `opencode upgrade`

## Troubleshooting

### Common Issues

1. **Authentication Problems**
   ```bash
   # Check authentication status
   opencode auth list

   # Re-authenticate if needed
   opencode auth logout
   opencode auth login
   ```

2. **Session Issues**
   ```bash
   # List recent sessions
   opencode stats

   # Start fresh session
   opencode --session new
   ```

3. **Model Access Issues**
   ```bash
   # Check available models
   opencode models

   # Use different model
   opencode --model openai/gpt-3.5-turbo
   ```

4. **Server Connection Problems**
   ```bash
   # Check server status
   opencode serve --port 3001

   # Try different port
   opencode attach http://localhost:3001
   ```

### Getting Help

- Use `--help` with any command for detailed usage information
- Check logs with `--print-logs --log-level DEBUG` for troubleshooting
- Visit the official documentation at https://opencode.ai/docs
- Report issues at https://github.com/sst/opencode

## Configuration

OpenCode uses configuration files located in `~/.config/opencode/`. Key configuration files include:

- `opencode.json`: Main configuration file
- `agent/`: Custom agent definitions
- `themes/`: Custom themes
- `docs/`: Documentation and guides

For detailed configuration options, refer to the individual documentation files in the `docs/` directory.