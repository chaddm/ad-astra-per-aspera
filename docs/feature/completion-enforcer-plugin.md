# OpenCode Plugin: Completion Enforcer

---

## 1. Purpose & Scope

Enforces that agent (LLM) responses are complete before they are allowed to drive
tool execution or user-visible progression. Focus: detection, retry injection, and
gating incomplete outputs.

## 2. Plugin Location

Per-project (recommended during development):

```
.opencode/plugin/completion-enforcer/
```

Global installation:

```
~/.config/opencode/plugin/completion-enforcer/
```

## 3. Required Files

```
opencode-plugin.json
main.js (or main.ts)
```

Optional supporting files:

```
/lib/*.js
/schema/*.json
/validators/*.js
```

## 4. Manifest (opencode-plugin.json)

```json
{
  "name": "completion-enforcer",
  "version": "1.0.0",
  "description": "Enforces that agent output is complete and retries if partial.",
  "entry": "main.js"
}
```

## 5. Event Model

Use the granular dot-form events as documented. Define specific handlers keyed by
event name or a generic `event` handler receiving `{ event }`.

### 5.1 Legacy → Current Mapping

If you encounter older plugin examples using colon-form events, map them as follows:

| Legacy (colon)   | Current (dot) suggestion                                                                | Notes                                                         |
| ---------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `agent:response` | `message.updated` / `message.part.updated`                                              | Use part updates for streaming detection.                     |
| `agent:request`  | (pre-send) not directly exposed; approximate with `session.status` or track prior state | Inject prompts before model call using internal client hooks. |
| `tool:execute`   | `tool.execute.before`                                                                   | Before execution.                                             |
| `tool:result`    | `tool.execute.after`                                                                    | After execution result available.                             |
| `session:start`  | `session.created`                                                                       | Session initialized.                                          |
| `session:end`    | `session.deleted` / `session.idle`                                                      | Deleted vs idle termination.                                  |

### 5.2 Core Categories for Completion Enforcement

- Message Events: `message.updated`, `message.part.updated` (stream parts),
  `message.removed`
- Session Events: `session.created`, `session.idle`, `session.error`,
  `session.updated`
- Tool Events: `tool.execute.before`, `tool.execute.after`

### 5.3 Additional Categories

- Command: `command.executed`
- File: `file.edited`, `file.watcher.updated`
- Installation: `installation.updated`
- LSP: `lsp.client.diagnostics`, `lsp.updated`
- Permission: `permission.replied`, `permission.updated`
- Server: `server.connected`
- Todo: `todo.updated`
- TUI: `tui.prompt.append`, `tui.command.execute`, `tui.toast.show`

### 5.4 Streaming Strategy

For streaming models, evaluate partial content incrementally with
`message.part.updated`; maintain a buffer and only mark complete after final
`message.updated` without incomplete indicators.

### 5.5 Tool Gating Logic

Intercept `tool.execute.before`; if last message flagged `incomplete`, throw or queue
tool call until a complete message arrives. Optionally attach a retry counter in
plugin state to prevent infinite retries.

## 6. Incomplete Output Detection

Simple heuristic patterns (baseline):

````js
const INCOMPLETE_PATTERNS = [
  /unfinished/i,
  /partial output/i,
  /…\s*$/,
  /\bTODO\b/,
  /\bcontinue\b$/,
  /\bWIP\b/i,
  /^\s*```[a-zA-Z0-9]*$/m, // unclosed code fence
  /:\s*$/, // trailing colon
];

function looksIncomplete(text) {
  if (!text) return true;
  const trimmed = text.trim();
  return INCOMPLETE_PATTERNS.some((r) => r.test(trimmed));
}
````

(Enhancements such as structural validation, token balance, or schema checks can be
layered later.)

## 7. Minimal Plugin (main.js)

```js
export const CompletionEnforcer = async (ctx) => {
  return {
    // Generic catch-all handler (receives every event)
    event: async ({ event }) => {
      if (event.type === "message.updated") {
        const msg = event.message; // shape provided by runtime
        if (looksIncomplete(msg.content)) {
          ctx.client.log.warn(
            "Detected incomplete output. Requesting continuation."
          );
          await ctx.client.messages.create({
            role: "user",
            content:
              "Your previous output was incomplete. Continue and finish the task without repeating prior text.",
          });
          // Optionally mark message so downstream handlers ignore it
          msg.meta = { ...(msg.meta || {}), incomplete: true };
        }
      }
    },

    // Gate tool execution until last response marked complete
    "tool.execute.before": async (input, output) => {
      const last = ctx.client.messages.last();
      if (last && last.meta && last.meta.incomplete) {
        throw new Error("Blocked tool execution due to incomplete prior output.");
      }
    },
  };
};
```

## 8. Installation Steps

1. Create directory: `.opencode/plugin/completion-enforcer/`
2. Add `opencode-plugin.json` and `main.js`
3. Restart OpenCode or trigger plugin reload.
4. Verify enabled status in plugin management interface.

## 9. Lifecycle Flow

1. Model produces/updates message (`message.updated`).
2. Plugin evaluates content; if incomplete: inject continuation instruction + flag
   message.
3. Subsequent tool invocations intercepted by `tool.execute.before` until a complete
   message appears.
4. Once complete, normal execution pipeline resumes.

## 10. Summary

This plugin demonstrates: granular event subscription, heuristic completion
detection, continuation prompting, and gating tool execution based on completeness
metadata.

---

Remaining Enhancements (see separate list after edits) will cover advanced
validation, configuration, logging, retry strategies, and extensibility.
