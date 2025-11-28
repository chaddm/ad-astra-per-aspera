# OpenCode Plugin: Enforcing Agent Completion

---

# 1. Overview

OpenCode supports a **plugin system** that lets you hook into internal agent events,
intercept messages, modify them, block them, or inject additional behavior. Plugins
run inside the OpenCode runtime and can enforce constraints such as:

- Detecting when the LLM stops mid-task
- Validating outputs
- Requesting retries
- Forcing the agent to continue until a “completion condition” is satisfied

This document provides everything needed to create a plugin that enforces completion
for all agent responses.

---

# 2. Plugin File Structure

A plugin is a directory placed under:

```bash
~/opencode/plugins/<plugin-name>/
```

It must contain:

```
plugin.json
main.js
```

Optional additional files:

```
/lib/*.js
/schema/*.json
/validators/*.js
```

---

# 3. `plugin.json` Structure

```json
{
  "name": "completion-enforcer",
  "version": "1.0.0",
  "description": "Enforces that agent output is complete and retries if partial.",
  "main": "main.js"
}
```

---

# 4. Plugin API Surface

OpenCode exposes three main plugin capabilities:

### **4.1 Event Hooks**

You can subscribe to internal events:

```js
exports.onEvent = (event, context) => {
  // event.type
  // event.data
};
```

Common events:

| Event            | Description                             |
| ---------------- | --------------------------------------- |
| `agent:response` | Fired when the LLM returns a message    |
| `agent:request`  | Fired before sending a prompt to an LLM |
| `tool:execute`   | Fired before a tool is run              |
| `tool:result`    | Fired when a tool returns               |
| `session:start`  | A new interactive session               |
| `session:end`    | Session ends                            |

---

### **4.2 Message Filtering**

You can modify or block messages:

```js
exports.filterResponse = async (response, context) => {
  return response; // or modified, or null to block
};
```

---

### **4.3 Tool Injection (Optional)**

You can add tools that OpenCode agents can call:

```js
exports.tools = [
  {
    name: "retry_completion",
    description: "Force retrying completion of partial output.",
    run: async (args, context) => { ... }
  }
];
```

---

# 5. Writing a Completion-Enforcer Plugin

Below is a minimal plugin (“completion-enforcer”) that enforces:

1. Validate LLM output
2. Detect incomplete/open-ended responses
3. Force a retry by modifying the agent prompt
4. Reissue a “continue/complete output” instruction
5. Prevent OpenCode from acting on partial tool calls

Place this in `main.js`:

```js
const INCOMPLETE_PATTERNS = [
  /unfinished/i,
  /partial output/i,
  /…\s*$/,
  /\bTODO\b/,
  /\bcontinue\b$/,
];

function looksIncomplete(text) {
  if (!text) return true;
  return INCOMPLETE_PATTERNS.some((r) => r.test(text.trim()));
}

exports.onEvent = async (event, context) => {
  // Hook after model responds
  if (event.type === "agent:response") {
    const { message } = event.data;

    if (looksIncomplete(message.content)) {
      context.logger.warn("Detected incomplete agent output. Forcing retry.");

      // Request the agent to continue
      context.agent.inject({
        role: "user",
        content:
          "Your previous output was incomplete. Continue and finish the task. Do not repeat prior text.",
      });

      // Prevent OpenCode from using the incomplete output
      event.cancel = true;
    }
  }
};
```

---

# 6. Installation

Create the plugin directory:

```bash
mkdir -p ~/.opencode/plugins/completion-enforcer
```

Add:

- `plugin.json`
- `main.js`

Restart OpenCode:

```bash
opencode restart
```

List plugins:

```bash
/op plugins
```

Enable it:

```bash
/op plugins enable completion-enforcer
```

---

# 7. How the Plugin Works

1. Agent generates a response
2. Plugin receives `agent:response`
3. Plugin examines output for incomplete patterns
4. If incomplete:

   - Cancels the response
   - Injects a “continue and finish” instruction
   - Causes the agent to regenerate

5. Agent continues until no incomplete pattern is detected
6. Only then is the response delivered to OpenCode’s tool pipeline

You can extend this by:

- Adding JSON schema validation
- Forcing deterministic structure
- Adding per-model retry limits
- Logging failure cases
- Enforcing multi-step completion

---

# 8. Optional: Strict Schema Enforcement

If you want the agent output to match a JSON schema before allowing tool execution:

```js
exports.filterResponse = (resp, context) => {
  try {
    JSON.parse(resp.content);
    return resp; // valid
  } catch (e) {
    context.agent.inject({
      role: "user",
      content: "Your response was not valid JSON. Output valid JSON only. Retry.",
    });
    return null; // block
  }
};
```

---

# 9. Summary

This document gives an LLM (or a human developer) everything required to create an
OpenCode plugin that enforces agent completion:

- Plugin directory structure
- Required files (`plugin.json`, `main.js`)
- Event hooks
- Message filtering
- Simple completion-detection logic
- Retry injection
- Optional schema enforcement

You can now produce plugins that actively validate, retry, and enforce full-output
generation before letting OpenCode execute any resulting tool calls.

---

If you want, I can generate:

- A stricter validator
- A version using JSON schema
- A version with a state machine (LangGraph-like)
- A plugin that tracks multi-step tasks and enforces completion across steps
