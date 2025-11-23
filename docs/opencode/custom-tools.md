# Custom Tools | opencode

**Important:**

- When writing custom tools, read `~/.config/opencode/docs/code-standards.md` for
  code standards and best practices.
- When creating or modifying tools, ensure you update any relevant documentation to
  keep it accurate and up to date.
  - Ensure that the tool's associated spec document is updated to reflect any
    changes, ie `tool/<tool-name>_spec.md`.
- Opencode runs on the `bun` runtime. Make sure any dependencies you use are
  compatible with `bun`. See
  [Bun's compatibility docs](https://bun.sh/docs/using-bun/compatibility) for more
  details.
- Use `bun` commands to install dependencies and run scripts during development.
  - `bun add <package>`
  - `bun test` script runs tests.
- Evaluate `package.json` and `bun.lock` for dependency management.

## Custom Tools

Custom tools are functions you create that the LLM can call during conversations.
They work alongside opencode’s [built-in tools](https://opencode.ai/docs/tools) like
`read`, `write`, and `bash`. They are automatically loaded at runtime from the
`tool/` directory. Tools provide only a simple description.

---

Tools are defined as **TypeScript** or **JavaScript** files.

---

### Location

They can be defined:

- Locally by placing them in the `.opencode/tool/` directory of your project.
- Or globally, by placing them in `~/.config/opencode/tool/`.

---

### Structure

The easiest way to create tools is using the `tool()` helper which provides
type-safety and validation.

```ts
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Query the project database",
  args: {
    query: tool.schema.string().describe("SQL query to execute"),
  },
  async execute(args) {
    // Your database logic here
    return `Executed query: ${args.query}`;
  },
});
```

The **filename** becomes the **tool name**. The above creates a `database` tool.

---

### Arguments

You can use `tool.schema`, which is just [Zod](https://zod.dev/), to define argument
types.

```ts
args: {
  query: tool.schema.string().describe("SQL query to execute");
}
```

You can also import [Zod](https://zod.dev/) directly and return a plain object:

```ts
import { z } from "zod";

export default {
  description: "Tool description",
  args: {
    param: z.string().describe("Parameter description"),
  },
  async execute(args, context) {
    // Tool implementation
    return "result";
  },
};
```

---

### Zod Argument Validation

Opencode tools use [Zod](https://zod.dev/) for argument validation. Zod provides both
type safety and runtime validation, ensuring that arguments passed to your tool are
correct and well-documented. This helps prevent errors and provides clear feedback to
both the LLM and the user.

#### Why use Zod?

- **Type safety**: Ensures arguments are the correct type at compile time
  (TypeScript).
- **Runtime validation**: Catches invalid input at runtime, returning helpful error
  messages.
- **Descriptive errors**: Zod errors are surfaced to the LLM and user, so clear
  messages improve usability.
- **Rich schemas**: Support for enums, unions, defaults, optionals, refinements, and
  more.

#### How to use Zod in tools

You can define argument schemas in two ways:

**1. Using `tool.schema` (recommended for most cases):**

```ts
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number to add"),
    b: tool.schema.number().describe("Second number to add"),
  },
  async execute(args) {
    return args.a + args.b;
  },
});
```

**2. Importing Zod directly (for advanced validation):**

```ts
import { z } from "zod";

export default {
  description: "Create a user with validation",
  args: {
    username: z.string().min(3).max(20).describe("Username (3-20 chars)"),
    email: z.string().email().describe("Valid email address"),
    age: z
      .number()
      .int()
      .min(0)
      .optional()
      .describe("Optional age, must be a non-negative integer"),
  },
  async execute(args) {
    // args are validated and typed
    return `Created user: ${args.username}`;
  },
};
```

#### Best Practices

- **Always use `.describe()`** on each argument for better LLM and user experience.
- **Validate all arguments**: Zod will automatically reject invalid input and return
  a helpful error.
- **Use advanced Zod features** for complex validation (e.g., `.refine`, `.default`,
  `.optional`, enums, unions).
- **Handle errors gracefully**: Zod errors are returned to the LLM/user, so make
  error messages clear and actionable.

---

## Stub Tool

Use this template to quickly create a new opencode tool. Fill in the placeholders and
comments as needed.

```ts
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "<Describe what this tool does>",
  args: {
    // Example argument:
    // param1: tool.schema.string().describe("Describe this parameter"),
    // param2: tool.schema.number().optional().describe("Optional number parameter"),
    // Add more arguments as needed
  },
  async execute(args, context) {
    // TODO: Implement the tool's logic here
    // args.param1, args.param2, ... are validated and typed
    // context contains session/agent info if needed
    return "<Result or output>";
  },
});
```

**Instructions:**

- Replace `<Describe what this tool does>` with a clear, concise description.
- Define arguments in the `args` object, using `tool.schema` and `.describe()` for
  each.
- Implement your logic in the `execute` function.
- Return a result or error message as appropriate.
- See the Zod Argument Validation section above for more on argument schemas.

---

Tools receive context about the current session:

```ts
import { tool } from "@opencode-ai/plugin";

export default tool({
  description: "Get project information",
  args: {},
  async execute(args, context) {
    // Access context information
    const { agent, sessionID, messageID } = context;
    return `Agent: ${agent}, Session: ${sessionID}, Message: ${messageID}`;
  },
});
```

---

You can also export multiple tools from a single file. Each export becomes **a
separate tool** with the name **`<filename>_<exportname>`**:

```ts
import { tool } from "@opencode-ai/plugin";

export const add = tool({
  description: "Add two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a + args.b;
  },
});

export const multiply = tool({
  description: "Multiply two numbers",
  args: {
    a: tool.schema.number().describe("First number"),
    b: tool.schema.number().describe("Second number"),
  },
  async execute(args) {
    return args.a * args.b;
  },
});
```

This creates two tools: `math_add` and `math_multiply`.

---

### Zod Validation
