# AGENTS.md

## Project Information

This project is for managing the global configuration of OpenCode, an open-source
text-based UI application that leverages large language models (LLMs) to assist with
developer-related tasks, including code generation, refactoring, documentation, file
and directory management, project orchestration, etc.

OpenCode is extended by creating files in specific directories to define custom
tools, commands, and agents to fit specific workflows. This directory
(`~/.config/opencode/`) is the global configuration location for OpenCode. OpenCode
implements the following concepts:

**Agents** are modes of operation that provides specialized behavior. The agents are
defined in the `agent/` directory as markdown files. The configuration defines the
name, description, LLM model with LLM parameters, permissions and system prompt.
Information on modifying agents is found in `docs/opencode/agents.md`. Instructions
may be `delegated` to agents which will run in a separate context. This allows the
agent to focus on the specific task without being distracted by other context or
information.

> Important - When a task is delegated to an agent, the new agent is created with an
> new context loaded the agent's system prompt and the prompt provided. It will not
> have access to the previous context or conversation history. Use the instructions
> provided to provide the appropriate context for the delegated task. Finally, always
> validate delegated tasks with acceptance criteria to ensure the agent performs the
> task as expected.

**Commands** are custom instructions for specific tasks that can be invoked by the
user with a slash (ie `/my-command`). Commands are defined by markdown files in the
`command/` directory. Information on creating commands is found in
`docs/opencode/commands.md`.

**Custom Tools** are JavaScript/TypeScript functions that can be invoked by agents to
perform programmatic tasks. Custom tools are defined in the `tool/` directory.
Information on developing custom tools is found in `docs/opencode/custom-tools.md`.
OpenCode uses the `bun` runtime and will include packages in the `package.json` file
for use in custom tools.

**Themes** define the appearance of OpenCode in the terminal. Themes are defined in
the `themes/` directory. Information on selecting or creating themes is found in
`docs/opencode/themes.md`.

**Technical Documentation** is provided in the `docs/` directory. This includes
technical documentation for being able to develop agents, commands, and tools. When
developing agents, commands, custom tools, specification files, tests, themes, etc,
always read related technical documentation under the `docs/` directory.

Notable directories are:

- `docs/opencode`: Directory containing technical documentation related to OpenCode
  configuration, development, and usage, including agents, commands, tools, themes,
  MCP servers, and more. Important OpenCode documentation files include:
  - `docs/opencode/agents.md`: Development guide to agent creation and configuration.
  - `docs/opencode/commands.md`: Development guide to creating and managing custom
    commands in OpenCode.
  - `docs/opencode/custom-tools.md`: Development guide for custom tools.
- `docs/guides/`: Directory containing user guides and tutorials for specific
  libraries and CLI tools as reference when developing custom tools or instructions
  for agents calling shell commands. Important guide files include:
  - `docs/guides/code-best-practices.md`: Always read this guide when developing
    code.
  - `docs/guides/toon-format.md`: Always read this guide when required to work with
    TOON format input/output.
- `docs/mcps/`: Directory containing documentation related to Model Context Protocol
  (MCP) servers, including setup guides and usage instructions for integrating

## Specific Purpose Agents

The following agents are specifically defined for particular tasks and have
instructions for their use cases. Delegate tasks to these agents when appropriate.
Provide clear instructions for _what_ you want the agent to do. The agent will handle
_how_ to do it based on its capabilities, ie "download model <model-name>" or
"convert `<input_file>` to h264 format with 1080p as `<output_file>`". Request help
from the agent if you are unsure how to phrase your request.

- **ollama**: Manages the host's ollama models, including downloading models,
  deleting models, and creating custom configurations.
- **ffmpeg**: Handles video and audio processing tasks using ffmpeg, including format
  conversion, compression, and extraction.
- **git**: Manages git repositories, including cloning, branching, committing, and
  pushing changes.
