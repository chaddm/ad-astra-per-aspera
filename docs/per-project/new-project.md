# New Project `.opencode` Setup Instructions

In order for `opencode` to be properly configured for a new project, a per-project
`.opencode` configuration directory must be created and populated with the necessary
subdirectories.

## Setting up a new per-project `.opencode` directory

1. Ensure the following local directories exist:

   1. `.opencode` - Root configuration directory.
   2. `.opencode/agent` - Agent configuration files.
   3. `.opencode/command` - Custom command definitions.
   4. `.opencode/docs` - Documentation How-To files.
   5. `.opencode/tool` - Tool configurations.
   6. `.opencode/themes` - Theme files.
   7. `.opencode/mcp` - MCP server configurations.

2. Create an empty object file in `.opencode/opencode.json` to signify that this is
   an `opencode` configuration directory.
