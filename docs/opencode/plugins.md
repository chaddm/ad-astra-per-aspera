# Plugins

This document describes how to create an **OpenCode plugin**, including structure,
lifecycle, event hooks, registration, and usage. It is designed to be executable by
an LLM with no additional clarification.

---

## 1. Overview

OpenCode supports a **plugin system** that allows you to:

- Hook into internal events (messages, tool calls, file actions, etc.)
- Register custom tools
- Extend agent behavior
- Intercept and modify LLM <-> agent interactions

Plugins are written in **TypeScript** and loaded by OpenCode at runtime.

---

## 2. Project Structure

A minimal plugin looks like this:

```
my-opencode-plugin/
├── package.json
├── src/
│   └── index.ts
├── opencode-plugin.json
├── tsconfig.json
```

### Required files

- `opencode-plugin.json` — Plugin manifest
- `src/index.ts` — Main plugin entrypoint

---

## 3. Plugin Manifest (`opencode-plugin.json`)

Example:

```json
{
  "name": "my-opencode-plugin",
  "version": "0.1.0",
  "description": "Example OpenCode plugin",
  "entry": "./dist/index.js"
}
```

OpenCode uses this file to load and initialize the plugin.

---

## 4. Basic Plugin Template (`src/index.ts`)

```ts
import type {
  OpenCodePlugin,
  PluginContext,
  AgentEvent,
  ToolDefinition,
} from "@opencode/plugin-api";

const plugin: OpenCodePlugin = {
  name: "my-opencode-plugin",

  async setup(ctx: PluginContext) {
    // Register event hooks
    ctx.on("agent:message", async (event: AgentEvent) => {
      console.log("Agent message:", event.message);
    });

    // Register a custom tool
    const echoTool: ToolDefinition = {
      name: "echo",
      description: "Echo text",
      inputSchema: {
        type: "object",
        properties: {
          text: { type: "string" },
        },
        required: ["text"],
      },
      async run({ text }) {
        return `Echo: ${text}`;
      },
    };

    ctx.registerTool(echoTool);
  },
};

export default plugin;
```

This file defines:

- A plugin name
- A `setup()` function
- Event hooks (e.g., `"agent:message"`)
- Custom tool registration

---

## 5. Supported Event Hooks

OpenCode exposes a rich set of lifecycle and activity events. Plugins may subscribe
using either of the two supported styles depending on the API you are targeting:

1. Agent-centered API (shown earlier in this doc):

```ts
ctx.on("<event>", handler);
```

2. Function-return plugin API (web docs style): return an object whose keys are event
   names (e.g. `"tool.execute.before"`) or provide a generic `event` handler that
   receives all events:

```ts
export const MyPlugin = async (ctx) => {
  return {
    "tool.execute.before": async (input, output) => {
      /* ... */
    },
    event: async ({ event }) => {
      if (event.type === "session.idle") {
        /* ... */
      }
    },
  };
};
```

### Core (Agent) Events (colon form)

These mirror higher-level agent interactions and are compatible with `ctx.on()`:

| Event name      | When fired                      |
| --------------- | ------------------------------- |
| `agent:message` | LLM sends a message to the user |
| `agent:input`   | User sends input into the agent |
| `tool:executed` | A tool completes execution      |
| `file:read`     | A file is read by the agent     |
| `file:write`    | A file is written/modified      |
| `session:start` | A new agent session begins      |
| `session:end`   | A session ends                  |

### Detailed Event Categories (dot form)

Below is the comprehensive list of fine‑grained events available (from the web plugin
documentation). Use the exact event string as the key in the returned hooks object or
compare against `event.type` inside a generic `event` handler.

#### Command Events

- `command.executed`

#### File Events

- `file.edited`
- `file.watcher.updated`

#### Installation Events

- `installation.updated`

#### LSP Events

- `lsp.client.diagnostics`
- `lsp.updated`

#### Message Events

- `message.part.removed`
- `message.part.updated`
- `message.removed`
- `message.updated`

#### Permission Events

- `permission.replied`
- `permission.updated`

#### Server Events

- `server.connected`

#### Session Events

- `session.created`
- `session.compacted`
- `session.deleted`
- `session.diff`
- `session.error`
- `session.idle`
- `session.status`
- `session.updated`

#### Todo Events

- `todo.updated`

#### Tool Events

- `tool.execute.before`
- `tool.execute.after`

#### TUI Events

- `tui.prompt.append`
- `tui.command.execute`
- `tui.toast.show`

### Choosing an Approach

- Use the colon form with `ctx.on()` when writing plugins against the
  `@opencode/plugin-api` TypeScript interface shown earlier.
- Use the dot form when authoring lightweight `.opencode/plugin/*.js` or `.ts` files
  that return a hooks object.
- You can mix: adopt dot events for granular control and still subscribe to
  high‑level colon events where supported.

Each event passes a typed payload (shape depends on the API variant). Inspect `event`
or provided handler parameters for available fields.

---

## 6. Registering Custom Tools

A tool definition includes:

```ts
ctx.registerTool({
  name: "my_tool",
  description: "Does something",
  inputSchema: {...},
  async run(args, ctx) {
    // implement tool behavior
    return {...};
  }
});
```

### Tool capabilities

- Structured JSON input
- Arbitrary output
- Access to workspace through plugin context
- Can be invoked by the LLM or manually via `/tool my_tool`

---

## 7. Accessing Files, Workspace, and State

Inside `setup(ctx)` or tool handlers:

```ts
ctx.workspace.readFile(path);
ctx.workspace.writeFile(path, contents);
ctx.workspace.listFiles();
ctx.state.set("key", value);
ctx.state.get("key");
```

LLMs can use tools to manipulate the workspace safely.

---

## 8. Building the Plugin

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true
  },
  "include": ["src"]
}
```

### Install dependencies

```bash
npm install @opencode/plugin-api
npm install --save-dev typescript
```

### Build

```bash
npm run build
```

(Define `build` script in package.json):

```json
{
  "scripts": {
    "build": "tsc"
  }
}
```

---

## 9. Installing Your Plugin in OpenCode

From inside OpenCode:

```
/plugins install /absolute/path/to/my-opencode-plugin
```

Or add to `~/.opencode/plugins.json`:

```json
{
  "plugins": ["/absolute/path/to/my-opencode-plugin"]
}
```

Restart OpenCode to activate.

---

## 10. Debugging

Enable plugin debug logs:

```
/debug plugins on
```

Check logs for event flow and tool activity.

---

## 11. Example: Completion-Enforcement Plugin

To enforce that the LLM completes tasks:

1. Hook `agent:message`
2. Detect partial/incomplete output
3. Auto-inject a follow-up prompt requesting continuation
4. Optionally block tool execution until output is complete
5. Optionally expose a custom “validate_output” tool

Example snippet:

```ts
ctx.on("agent:message", async (event) => {
  if (!isComplete(event.message)) {
    ctx.sendSystemMessage(
      "Your previous output was incomplete. Continue from where you left off."
    );
  }
});
```

The plugin system allows full workflow control.

---

# Summary

This document provides all required instructions for an LLM to:

- Understand the OpenCode plugin system
- Create a valid plugin structure
- Register hooks and tools
- Interact with the workspace
- Build and install the plugin
- Extend OpenCode behavior programmatically

If you want, I can now generate:

✅ A **complete starter plugin** ✅ A **plugin that enforces agent completion** ✅ A
**plugin that guards tool calls** ✅ A **plugin that adds verification steps before
file writes**

Which would you like?
