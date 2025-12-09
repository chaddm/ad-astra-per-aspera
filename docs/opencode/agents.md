# Agent Settings

Agents in OpenCode can be customized through frontmatter settings defined at the top
of the agent markdown file. These settings control various aspects of the agent's
behavior, including its description, mode, permissions, and available tools. Agents
are defined in as markdown documents in the `agent/` directory.

## Basic Settings

- `description` - A brief description of the agent's purpose.
- `mode` - The mode of the agent. Types are:
  - `primary`: Drives high-level orchestration and delegates tasks to other.
  - `subagent`: Does not appear in the user's agent list and is only invoked by
    primary agents.
  - `all`: Appears in the user's agent list and can also be invoked by primary
    agents.
- `model` - The LLM model to use for the agent. This can be any supported model.
  Common models are:
  - `github-copilot/gpt-4.1`
  - `github-copilot/claude-sonnet-4.5`.

Model-specific parameters can be set using additional frontmatter settings. For
example:

`temperature` - The temperature setting for the LLM.

## Permissions

The `permission` control is for functionality that agents can access. This includes
file manipulation, shell command execution, web fetching, and more. Permissions are
defined under the `permission` frontmatter setting. Each permission can be set to one
of three values:

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

<<<<<<< HEAD
||||||| parent of 762deb4 (Add attach functionality to demongrep tool and refactor search to use attached server state)
Project orchestrator that delegates tasks to specialized subagents. Breaks down user
problems into tasks for subagents, always using subagents in read-only mode. Notifies
the user when subagents are launched and provides updates as tasks are completed.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Answering project or general questions by orchestrating
subagents

### **@claud-think**

Project orchestrator that coordinates work by delegating tasks to specialized
subagents. Does not perform implementation work directly, but analyzes requests and
invokes the right subagents. Notifies the user when subagents are launched and
provides updates as tasks are completed.

**Model**: github-copilot/claude-sonnet-4 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Project orchestration, delegating to subagents

### **@gpt-think**

Project orchestrator that coordinates work by delegating tasks to specialized
subagents. Does not perform implementation work directly, but analyzes requests and
invokes the right subagents. Notifies the user when subagents are launched and
provides updates as tasks are completed.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Project orchestration, delegating to subagents

---

## Subagents

Subagents handle specific specialized tasks and are invoked by primary agents or
directly by users.

### Code & Repository Management

#### **@opencode**

Modifies `.opencode` configuration in a project. Handles both per-project `.opencode`
and global `~/.config/opencode` configuration directories.

**Model**: github-copilot/gpt-4o **Tools**: write, edit, bash, mcp-context7 **Use
for**: Configuration management, setting up OpenCode for new projects

#### **@review**

Reviews code for quality and best practices. Provides constructive feedback without
making direct changes.

**Model**: github-copilot/claude-sonnet-4.5 **Tools**: All tools disabled (read-only
analysis) **Use for**: Code review, identifying bugs, performance issues, security
concerns

### Research & Analysis

#### **@research-repository**

Coordinates codebase research by delegating to @files-find and @files-read. Never
searches for or reads files directly - always delegates these tasks.

**Model**: github-copilot/gpt-4o **Tools**: All tools disabled except coordination
**Use for**: Analyzing code, finding usages, tracing execution paths, gathering
technical details

#### **@files-read**

Analyzes file contents and provides detailed information. Use for file summaries,
documenting modules/classes/functions, and extracting specific line ranges.

**Model**: Specialized for file analysis **Tools**: read, analysis tools **Use for**:
Reading files, documenting code structure, extracting specific sections

#### **@deep-build**

Fully autonomous subagent that plans and executes a prompt without any user
interaction, confirmation, or inquiries. Upon receiving a prompt, it generates a
step-by-step plan and executes each step using all available tools. It never asks for
clarification or confirmation, and always attempts to complete the task to the best
of its ability, even if the prompt is ambiguous or incomplete.

**Model**: github-copilot/gpt-4.1 **Tools**: write, edit, bash, fetch, task **Use
for**: Planning and executing tasks end-to-end with no user interaction

#### **@plan-sequence**

Given a plan, returns a markdown list of sequential actions by calling the
sequential-thinking MCP. Breaks down plans into actionable steps and returns them as
a numbered list.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to MCPs)
**Use for**: Converting plans into actionable sequences

#### **@plan-goals**

Given a prompt, returns a markdown list of sequential actions using
tractatus-thinking and plan-sequence. Breaks down prompts into plans and sequences of
actions.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to MCPs
and subagents) **Use for**: Decomposing prompts into plans and sequences

### Web & External Resources

#### **@web-search**

Performs web research using DuckDuckGo. Coordinates parallel page fetching via
@web-fetch and synthesizes results from multiple sources.

**Model**: Optimized for web research **Tools**: web search, coordination **Use
for**: Finding information online, researching documentation, gathering external
resources

#### **@web-fetch**

Fetches and analyzes webpage content. Use for retrieving information from specific
URLs.

**Model**: Web content analysis **Tools**: webfetch, content analysis **Use for**:
Retrieving specific webpage content, analyzing online documentation

### Development Tools

#### **@mcp-builder**

Specialized agent for building and managing MCP (Model Context Protocol) servers and
integrations.

**Tools**: Development and build tools **Use for**: Creating MCP servers, managing
protocol integrations

#### **@ollama**

Manages Ollama models and configurations. Handles downloading/pulling models,
deleting models, showing model information, creating custom models with Modelfiles,
copying models, managing server operations, and authentication. Provides
markdown-formatted responses by default.

**Tools**: bash, write, read **Use for**: All Ollama-related model management tasks,
server operations, model creation and customization

#### **@git**

Executes git commands as a non-interactive git expert. Parses instructions,
determines the appropriate git commands, executes them, and returns a summary of
actions and results.

**Model**: github-copilot/gpt-4.1 **Tools**: bash **Use for**: Version control
operations, git commands, repository management

#### **@files-write**

Creates, overwrites, or patches files according to instructions. Ensures only the
specified changes are made and preserves unrelated content.

**Model**: github-copilot/gpt-4.1 **Tools**: write, edit, bash **Use for**: Creating,
editing, and patching files as instructed

---

## Configuration

### Agent Selection

You can specify which primary agent to use in your OpenCode configuration:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": "deepthought"
}
=======
Project orchestrator that delegates tasks to specialized subagents. Breaks down user
problems into tasks for subagents, always using subagents in read-only mode. Notifies
the user when subagents are launched and provides updates as tasks are completed.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Answering project or general questions by orchestrating
subagents

### **@claud-think**

Project orchestrator that coordinates work by delegating tasks to specialized
subagents. Does not perform implementation work directly, but analyzes requests and
invokes the right subagents. Notifies the user when subagents are launched and
provides updates as tasks are completed.

**Model**: github-copilot/claude-sonnet-4 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Project orchestration, delegating to subagents

### **@gpt-think**

Project orchestrator that coordinates work by delegating tasks to specialized
subagents. Does not perform implementation work directly, but analyzes requests and
invokes the right subagents. Notifies the user when subagents are launched and
provides updates as tasks are completed.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to
subagents) **Use for**: Project orchestration, delegating to subagents

---

## Subagents

Subagents handle specific specialized tasks and are invoked by primary agents or
directly by users.

### Code & Repository Management

#### **@opencode**

Modifies `.opencode` configuration in a project. Handles both per-project `.opencode`
and global `~/.config/opencode` configuration directories.

**Model**: github-copilot/gpt-4o **Tools**: write, edit, bash, mcp-context7 **Use
for**: Configuration management, setting up OpenCode for new projects

#### **@review**

Reviews code for quality and best practices. Provides constructive feedback without
making direct changes.

**Model**: github-copilot/claude-sonnet-4.5 **Tools**: All tools disabled (read-only
analysis) **Use for**: Code review, identifying bugs, performance issues, security
concerns

### Research & Analysis

#### **@research-repository**

Generates research results by coordinating file search and analysis. Provide a string
for exact/semantic search or instructions/goals for deriving search queries.

#### **@files-read**

Analyzes file contents and provides detailed information. Use for file summaries,
documenting modules/classes/functions, and extracting specific line ranges.

**Model**: Specialized for file analysis **Tools**: read, analysis tools **Use for**:
Reading files, documenting code structure, extracting specific sections

#### **@deep-build**

Fully autonomous subagent that plans and executes a prompt without any user
interaction, confirmation, or inquiries. Upon receiving a prompt, it generates a
step-by-step plan and executes each step using all available tools. It never asks for
clarification or confirmation, and always attempts to complete the task to the best
of its ability, even if the prompt is ambiguous or incomplete.

**Model**: github-copilot/gpt-4.1 **Tools**: write, edit, bash, fetch, task **Use
for**: Planning and executing tasks end-to-end with no user interaction

#### **@plan-sequence**

Given a plan, returns a markdown list of sequential actions by calling the
sequential-thinking MCP. Breaks down plans into actionable steps and returns them as
a numbered list.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to MCPs)
**Use for**: Converting plans into actionable sequences

#### **@plan-goals**

Given a prompt, returns a markdown list of sequential actions using
tractatus-thinking and plan-sequence. Breaks down prompts into plans and sequences of
actions.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to MCPs
and subagents) **Use for**: Decomposing prompts into plans and sequences

### Web & External Resources

#### **@web-search**

Performs web research using DuckDuckGo. Coordinates parallel page fetching via
@web-fetch and synthesizes results from multiple sources.

**Model**: Optimized for web research **Tools**: web search, coordination **Use
for**: Finding information online, researching documentation, gathering external
resources

#### **@web-fetch**

Fetches and analyzes webpage content. Use for retrieving information from specific
URLs.

**Model**: Web content analysis **Tools**: webfetch, content analysis **Use for**:
Retrieving specific webpage content, analyzing online documentation

### Development Tools

#### **@mcp-builder**

Specialized agent for building and managing MCP (Model Context Protocol) servers and
integrations.

**Tools**: Development and build tools **Use for**: Creating MCP servers, managing
protocol integrations

#### **@ollama**

Manages Ollama models and configurations. Handles downloading/pulling models,
deleting models, showing model information, creating custom models with Modelfiles,
copying models, managing server operations, and authentication. Provides
markdown-formatted responses by default.

**Tools**: bash, write, read **Use for**: All Ollama-related model management tasks,
server operations, model creation and customization

#### **@git**

Executes git commands as a non-interactive git expert. Parses instructions,
determines the appropriate git commands, executes them, and returns a summary of
actions and results.

**Model**: github-copilot/gpt-4.1 **Tools**: bash **Use for**: Version control
operations, git commands, repository management

#### **@files-write**

Creates, overwrites, or patches files according to instructions. Ensures only the
specified changes are made and preserves unrelated content.

**Model**: github-copilot/gpt-4.1 **Tools**: write, edit, bash **Use for**: Creating,
editing, and patching files as instructed

---

## Configuration

### Agent Selection

You can specify which primary agent to use in your OpenCode configuration:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "agent": "deepthought"
}
>>>>>>> 762deb4 (Add attach functionality to demongrep tool and refactor search to use attached server state)
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

The `tool` control is for extensions to the Opencode program, which includes built-in
extensions, custom tool extensions, and configured MCP services. Each permission can
be set to `true` or `false` to enable or disable the tool for the agent.

Built-in Opencode tools are listed by name:

- `bash` - Allows shell command execution.
- `edit` - Allows file editing by string match-and-replace.
- `write` - Allows file creation and overwriting.
- `read` - Allows file reading.
- `grep` - Allows searching file contents.
- `glob` - Allows searching for files and directories by pattern.
- `list` - Allows listing files and directories. analysis and completion.
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
  patch: true
  skill: true
---
```

> Note: Unlike permissions, tools are enabled or disabled without granular control
> over specific commands or functions.

## Example Starter Agent Configuration

The following is a starter "safe" agent configuration that enables basic read-only
access without any file modifications or shell command execution.

```
---
description: Project orchestrator that delegates tasks to specialized subagents.
mode: primary
model: github-copilot/gpt-4.1
temperature: 0.1
permission:
  external_directory: ask
  doom_loop: allow
  edit: ask
  patch: ask
  write: ask
  webfetch: allow
  bash: ask
  skill: ask
tools:
  bash: true
  edit: true
  write: true
  read: true
  grep: true
  glob: true
  list: true
  patch: false
  skill: true
---

You are the project orchestrator. Your role is to coordinate work across the project
by delegating tasks to specialized subagents.
```
