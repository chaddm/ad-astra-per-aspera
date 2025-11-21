# Commands Management Guide

## Overview

Commands in OpenCode are custom shortcuts that allow you to execute predefined
prompts quickly through the TUI interface. They provide a powerful way to automate
repetitive tasks and standardize common workflows by typing `/command-name` in the
TUI.

Custom commands complement the built-in commands like `/init`, `/undo`, `/redo`,
`/share`, and `/help`, allowing you to extend OpenCode's functionality with
project-specific or workflow-specific automation.

## Preferred Configuration Approach

**OpenCode strongly recommends using Markdown files over JSON configuration** for defining commands. This approach provides several advantages:

- **Better readability**: Markdown files are easier to read and maintain
- **Version control friendly**: Better diff visualization and collaboration
- **Separation of concerns**: Each command has its own file
- **Rich formatting**: Support for complex prompt structures
- **Easier management**: Simple file-based organization

Use JSON configuration only when you need programmatic generation or have specific integration requirements.

## File Structure and Naming Conventions

Commands can be defined at two levels:

### Global Commands
```
~/.config/opencode/command/
├── test.md
├── deploy.md
├── review.md
└── analyze-coverage.md
```

### Per-Project Commands
```
.opencode/command/
├── build-component.md
├── run-migrations.md
└── custom-lint.md
```

**Naming Conventions:**
- Use lowercase filenames with hyphens for multi-word commands
- File extension must be `.md`
- Filename becomes the command name (e.g., `test.md` → `/test`)
- Avoid spaces and special characters in filenames
- Use descriptive names that clearly indicate the command's purpose

## Command File Format

### Basic Structure

Each command file follows this structure:

```markdown
---
description: Brief description of the command
agent: optional-agent-name
subtask: true/false
model: optional-model-override
---

Your command prompt template goes here.
This content will be sent to the LLM when the command is executed.
```

### Frontmatter Options

The YAML frontmatter supports the following options:

- **`description`** (string): Brief description shown in TUI
- **`agent`** (string, optional): Specific agent to execute the command
- **`subtask`** (boolean, optional): Force subagent invocation
- **`model`** (string, optional): Override default model for this command

### Example Command File

```markdown
---
description: Run comprehensive test suite with coverage analysis
agent: build
model: anthropic/claude-3-5-sonnet-20241022
subtask: true
---

Run the full test suite with coverage report and show any failures.
Focus on the failing tests and suggest specific fixes.
Analyze coverage gaps and recommend additional test cases.
```

## Prompt Configuration Features

### Arguments

Commands support dynamic arguments through placeholder substitution:

#### Using $ARGUMENTS
```markdown
---
description: Create a new React component
---

Create a new React component named $ARGUMENTS with TypeScript support.
Include proper typing, basic structure, and export statement.
```

Usage: `/component Button`

#### Using Positional Parameters
```markdown
---
description: Create file with specific content
---

Create a file named $1 in the directory $2 with the following content: $3
Ensure proper file permissions and validate the directory exists.
```

Usage: `/create-file config.json src "{ \"key\": \"value\" }"`

### Shell Output Integration

Inject live command output using `!`command`` syntax:

```markdown
---
description: Analyze current test coverage
---

Here are the current test results:
!`npm test -- --coverage`

Based on these results, suggest improvements to increase coverage and identify critical gaps.
```

**Important Notes:**
- Commands run from your project's root directory
- Output becomes part of the prompt sent to the LLM
- Use this for dynamic data that changes between runs
- Ensure commands are cross-platform compatible when possible

### File References

Include file content using `@filename` syntax:

```markdown
---
description: Review component implementation
---

Review the component in @src/components/Button.tsx and @src/components/Button.test.tsx.
Check for:
- Performance issues
- Accessibility compliance
- Test coverage completeness
- TypeScript best practices
```

## Configuration Options Reference

### Template
**Required** - The main prompt content sent to the LLM.

```markdown
---
description: Example command
---

This is the template content that will be processed and sent to the LLM.
It can include placeholders, shell commands, and file references.
```

### Description
**Optional** - Brief description shown in the TUI when browsing commands.

```yaml
description: "Run tests with coverage analysis"
```

### Agent
**Optional** - Specifies which agent should execute the command.

```yaml
agent: build  # Uses the 'build' agent instead of current agent
```

- If the specified agent is a subagent, the command triggers subagent invocation by default
- To disable subagent behavior, set `subtask: false`

### Subtask
**Optional** - Boolean flag to force subagent invocation.

```yaml
subtask: true  # Forces subagent mode even if agent is configured as primary
```

Useful for commands that shouldn't pollute the primary conversation context.

### Model
**Optional** - Override the default model for this specific command.

```yaml
model: "anthropic/claude-3-5-sonnet-20241022"
```

## Common Command Patterns

### Testing Commands

```markdown
---
description: Run focused test suite
agent: build
---

Run tests for the current feature branch:
!`git diff --name-only main... | grep -E '\.(test|spec)\.(js|ts|jsx|tsx)$'`

Focus on any failing tests and provide specific fix recommendations.
```

### Code Review Commands

```markdown
---
description: Review recent changes
subtask: true
---

Review the recent changes:
!`git diff HEAD~3..HEAD`

Analyze for:
- Code quality issues
- Security vulnerabilities
- Performance implications
- Breaking changes
```

### Development Workflow Commands

```markdown
---
description: Prepare feature for review
---

Analyze the current feature branch:
!`git log --oneline main..HEAD`
!`git diff --stat main..HEAD`

Ensure the feature is ready for code review by checking:
- All tests pass
- Documentation is updated
- No debugging code remains
- Commit messages are clear
```

### Documentation Commands

```markdown
---
description: Generate API documentation
agent: docs
---

Generate comprehensive API documentation for @src/api/routes.ts.
Include:
- Endpoint descriptions
- Request/response schemas
- Error handling
- Usage examples
```

## Best Practices for Command Creation

### 1. Clear and Descriptive Names
- Use action-oriented names: `test-coverage`, `deploy-staging`, `review-pr`
- Avoid generic names like `run` or `check`
- Consider team conventions and existing patterns

### 2. Comprehensive Descriptions
- Write clear, concise descriptions for the TUI display
- Explain what the command does and when to use it
- Include any prerequisites or assumptions

### 3. Robust Error Handling
- Consider what happens when shell commands fail
- Provide fallback instructions in prompts
- Test commands in different project states

### 4. Documentation and Context
- Include relevant file references when analyzing code
- Provide enough context for the LLM to give useful responses
- Consider the audience (junior vs senior developers)

### 5. Performance Considerations
- Be mindful of large file inclusions
- Use shell commands judiciously to avoid long execution times
- Consider using `subtask: true` for resource-intensive commands

### 6. Maintainability
- Keep commands focused on single responsibilities
- Use consistent formatting and structure
- Comment complex shell command chains
- Version control your command files

### 7. Security Awareness
- Avoid including sensitive information in commands
- Be careful with shell command injection possibilities
- Review commands that accept user arguments

## Handling Built-in vs Custom Commands

### Built-in Commands
OpenCode includes several built-in commands:
- `/init` - Initialize new projects
- `/undo` - Undo last action
- `/redo` - Redo last undone action
- `/share` - Share conversation
- `/help` - Show help information

### Custom Command Override Behavior
**Custom commands can override built-in commands.** If you create a custom command with the same name as a built-in command, your custom version takes precedence.

**Use this capability carefully:**
```markdown
# Override the built-in help command (not recommended)
---
description: Custom help with project-specific information
---

Custom help content here...
```

**Recommended approach:** Use unique names to avoid conflicts and maintain built-in functionality.

### Command Precedence Order
1. Per-project commands (`.opencode/command/`)
2. Global commands (`~/.config/opencode/command/`)
3. Built-in commands

### JSON Configuration Alternative

While Markdown is preferred, JSON configuration is available when needed:

```json
{
  "$schema": "https://opencode.ai/config.json",
  "command": {
    "test": {
      "template": "Run the full test suite with coverage report.",
      "description": "Run tests with coverage",
      "agent": "build",
      "model": "anthropic/claude-3-5-sonnet-20241022",
      "subtask": true
    }
  }
}
```

**When to use JSON:**
- Programmatic command generation
- Integration with existing JSON-based configurations
- Complex templating requirements
- Automated configuration management

## Troubleshooting Common Issues

### Command Not Found
- Verify file is in correct directory (`command/` not `commands/`)
- Check filename has `.md` extension
- Ensure no typos in command name

### Shell Commands Not Working
- Verify commands work in terminal first
- Check working directory assumptions
- Ensure cross-platform compatibility
- Test with different project states

### File References Not Working
- Use relative paths from project root
- Verify file exists and is accessible
- Check for typos in file paths
- Consider using glob patterns for multiple files

### Arguments Not Substituted
- Verify placeholder syntax (`$ARGUMENTS`, `$1`, `$2`, etc.)
- Check for extra spaces or formatting issues
- Test with simple examples first
- Ensure arguments are passed correctly when invoking

This comprehensive guide should help you effectively manage and create commands in OpenCode, emphasizing the preferred Markdown approach while providing complete coverage of all available features and best practices.