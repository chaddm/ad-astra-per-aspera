# Agents | OpenCode

> ## Excerpt
>
> Configure and use OpenCode's intelligent agents for specialized tasks.

---

Agents are intelligent assistants that handle different types of tasks in OpenCode.
There are two types of agents: **primary agents** that orchestrate work, and
**subagents** that handle specific specialized tasks.

By default, OpenCode uses a primary agent that can delegate work to various subagents
as needed. You can also invoke subagents directly using the `@agent-name` syntax.

---

## Primary Agents

### **@vibe-kanban**

Expert agent for managing and automating kanban board workflows using the vibe-kanban
MCP API. Handles project and task management, automation, and kanban best practices.

**Model**: github-copilot/gpt-4.1 **Tools**: All tools disabled (delegates to MCP
API) **Use for**: Listing projects, managing tasks, updating statuses, automating
kanban workflows, and integrating with code agents.

**Capabilities:**

- List all projects and their details
- List, create, update, and delete tasks in any project
- Retrieve detailed information about any task
- Start and track task attempts (for agent/automation workflows)
- Filter tasks by status (e.g., todo, inprogress, done)
- Provide best practices for kanban task management

**Supported MCP Calls:**

- list_projects
- list_tasks
- create_task
- get_task
- update_task
- delete_task
- start_task_attempt

**Usage Example:**

```
{
  "action": "create_task",
  "project_id": "your-project-id",
  "title": "My New Task",
  "description": "Optional details about the task"
}
```

Returns the created task object.

Primary agents coordinate work across the project by analyzing requests and
delegating to appropriate subagents.

### **@ask**

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

Coordinates codebase research by delegating to @find-files and @read-file. Never
searches for or reads files directly - always delegates these tasks.

**Model**: github-copilot/gpt-4o **Tools**: All tools disabled except coordination
**Use for**: Analyzing code, finding usages, tracing execution paths, gathering
technical details

#### **@read-file**

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

#### **@plan-tractacus**

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

#### **@write-file**

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
```

### Custom Agents

Create custom agents by adding Markdown files to the `agent/` directory:

```markdown
---
description: My custom agent for specific tasks
mode: subagent
model: github-copilot/gpt-4o
temperature: 0.1
tools:
  write: true
  edit: false
  bash: true
---

You are a specialized agent for handling specific tasks...
```

> **⚠️ Important Note for Creating New Agents**
>
> When creating a new agent, do not attempt to test it immediately. After completing
> the agent creation process (including adding the agent configuration file and
> updating opencode.json), inform the user that **OpenCode must be restarted** for
> the new agent to take effect.
>
> The new agent will not be available until OpenCode is fully restarted.

### Agent Tools

Control which tools each agent can access:

```yaml
---
description: Read-only analysis agent
mode: subagent
tools:
  write: false
  edit: false
  bash: false
---
```

---

## Usage

### Direct Invocation

Invoke specific subagents directly using the `@` syntax:

```
@review Please review this code for security issues
@ollama Download and set up the llama2 model
@web-search Find documentation for React hooks
```

### Coordinated Work

Primary agents automatically delegate to appropriate subagents:

```
Analyze the authentication system and suggest improvements
```

The primary agent will:

1. Use @research-repository to analyze the codebase
2. Use @review to identify potential issues
3. Use @web-search to find best practices
4. Synthesize recommendations

---

## Agent Capabilities

### **File Operations**

- **@read-file**: Read and analyze file contents
- **@opencode**: Modify configuration files
- **@review**: Analyze code without modifications

### **Research & Discovery**

- **@research-repository**: Coordinate multi-file analysis
- **@web-search**: Find online resources and documentation
- **@web-fetch**: Retrieve specific web content

### **Model Management**

- **@ollama**: Complete Ollama model lifecycle management
- **@mcp-builder**: Build and configure MCP servers

### **Project Coordination**

---

## Best Practices

1. **Use Specific Agents**: Invoke subagents directly for specialized tasks rather
   than using general prompts
2. **Leverage Coordination**: Let primary agents handle complex workflows that
   require multiple capabilities
3. **Configure Appropriately**: Set up agent tools and permissions based on your
   project needs
4. **Follow Patterns**: Use the established agent patterns when creating custom
   agents

---

For more information about configuring agents, see the
[tools documentation](tools.md) and [MCP servers guide](mcp-servers.md).
