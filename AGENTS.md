# AGENTS.md

## Purpose

This directory serves as the global configuration directory for the `opencode`
application. Agents working in `~/.config/opencode/` directory are responsible for
managing and maintaining the global configuration files, adding or modifying agents
and tools, and ensuring the integrity of the `opencode` setup.

**ALL AGENTS ARE GLOBAL**: NEVER generate per-project-specific configuration files here.

## Responsibilities

1. **Configuration Management**:
   - Modify and maintain `opencode` configuration files located in this directory.
   - Ensure all changes are backward-compatible and do not disrupt existing functionality.
   - Follow the established structure and naming conventions for configuration files.

2. **Agent and Tool Management**:
   - Add new agents or tools as required by the application.
   - Modify existing agents or tools to improve functionality or fix issues.
   - Manage custom commands in the `command/` directory for extending OpenCode functionality.
   - Ensure all agents and tools are properly documented and adhere to the `opencode` standards.

3. **Integrity and Validation**:
   - Validate configuration changes to ensure they meet the application's requirements.
   - Test changes thoroughly to prevent regressions.
   - Ensure that all changes are compatible with the automatic build and test systems of the `opencode` application.

## Configuration Guidelines

1. **File Structure**:
   - Maintain a clear and logical structure for configuration files.
   - Use descriptive file names to indicate their purpose.

2. **Formatting**:
   - Use JSON or YAML for configuration files, depending on the application's requirements.
   - Ensure proper indentation and consistent formatting.

3. **Version Control**:
   - Commit changes to configuration files with clear and concise commit messages.
   - Document the purpose of changes in the commit message.

4. **Error Handling**:
   - Validate configuration files for syntax errors before committing.
   - Use tools or scripts to check for common issues.

5. **Documentation**:
   - Document the purpose and usage of each configuration file.
   - Include comments within configuration files where necessary to explain complex settings.

## Technical Documentation Guide

This section provides a quick reference to the technical documentation available in
the `docs` directory. Use these resources to understand and configure various aspects
of OpenCode.

1. **`agents.md`**:
   - **Content**: Overview of agents, their types (primary and subagents), and usage instructions.
   - **When to Read**: Refer to this file to learn about the different agents
     available in OpenCode, how to configure them, and their specific use cases.

2. **`tools.md`**:
   - **Content**: Guide to creating and managing custom tools that the LLM can call
     during conversations.
   - **When to Read**: Use this file when you need to define new tools or extend the
     functionality of OpenCode with custom logic.

3. **`mcp-servers.md`**:
   - **Content**: Instructions for adding and managing MCP (Model Context Protocol)
     servers, both local and remote.
   - **When to Read**: Consult this file when integrating external tools or services
     into OpenCode using MCP servers.

4. **`themes.md`**:
   - **Content**: Guide to selecting, customizing, and managing themes in OpenCode.
   - **When to Read**: Refer to this file to learn about built-in themes, creating
     custom themes, and ensuring compatibility with your terminal.

5. **`commands.md`**:
   - **Content**: Instructions for creating and managing custom commands that extend
     OpenCode's functionality through the command system.
   - **When to Read**: Consult this file when you need to create custom commands or
     modify existing commands in the `command/` directory.

6. **`opencode-cli.md`**:
   - **Content**: Complete reference guide for the OpenCode command-line interface,
     including all commands, options, switches, installation methods, usage examples,
     and best practices.
   - **When to Read**: Reference this file when you need to understand OpenCode CLI
     commands, set up installation, learn command-line options, or find examples for
     specific workflows and use cases.
