---
created: 2025-11-02T21:45:36 (UTC -06:00)
tags: []
source: https://opencode.ai/docs/custom-tools/
author:
---

# Custom Tools | opencode

Important:
  - When writing custom tools, read `~/.config/opencode/docs/code-standards.md` for
    code standards and best practices.
  - When creating or modifying tools, ensure you update any relevant documentation to
    keep it accurate and up to date.

---
Create tools the LLM can call in opencode.

Custom tools are functions you create that the LLM can call during conversations.
They work alongside opencode’s [built-in tools](https://opencode.ai/docs/tools) like
`read`, `write`, and `bash`.

___

Tools are defined as **TypeScript** or **JavaScript** files.

___

### [Location](https://opencode.ai/docs/custom-tools/#location)

They can be defined:

-   Locally by placing them in the `.opencode/tool/` directory of your project.
-   Or globally, by placing them in `~/.config/opencode/tool/`.

___

### [Structure](https://opencode.ai/docs/custom-tools/#structure)

The easiest way to create tools is using the `tool()` helper which provides
type-safety and validation.

```
<div><p><span>import</span><span> { tool } </span><span>from</span><span> </span><span>"@opencode-ai/plugin"</span></p></div><div><p><span>export</span><span> </span><span>default</span><span> </span><span>tool</span><span>({</span></p></div><div><p><span><span>  </span></span><span>description: </span><span>"Query the project database"</span><span>,</span></p></div><div><p><span><span>  </span></span><span>args: {</span></p></div><div><p><span><span>    </span></span><span>query: tool.schema.</span><span>string</span><span>().</span><span>describe</span><span>(</span><span>"SQL query to execute"</span><span>),</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>async</span><span> </span><span>execute</span><span>(</span><span>args</span><span>) {</span></p></div><div><p><span>    </span><span>// Your database logic here</span></p></div><div><p><span>    </span><span>return</span><span> </span><span>`Executed query: ${</span><span>args</span><span>.</span><span>query</span><span>}`</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>})</span></p></div>
```

The **filename** becomes the **tool name**. The above creates a `database` tool.

___

### [Arguments](https://opencode.ai/docs/custom-tools/#arguments)

You can use `tool.schema`, which is just [Zod](https://zod.dev/), to define argument
types.

```
<div><p><span>args</span><span>: {</span></p></div><div><p><span>  </span><span>query</span><span>: </span><mark><span>tool.schema</span></mark><span>.</span><span>string</span><span>().</span><span>describe</span><span>(</span><span>"SQL query to execute"</span><span>)</span></p></div><div><p><span>}</span></p></div>
```

You can also import [Zod](https://zod.dev/) directly and return a plain object:

```
<div><p><span>import</span><span> { z } </span><span>from</span><span> </span><span>"zod"</span></p></div><div><p><span>export</span><span> </span><span>default</span><span> {</span></p></div><div><p><span><span>  </span></span><span>description: </span><span>"Tool description"</span><span>,</span></p></div><div><p><span><span>  </span></span><span>args: {</span></p></div><div><p><span><span>    </span></span><span>param: z.</span><span>string</span><span>().</span><span>describe</span><span>(</span><span>"Parameter description"</span><span>),</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>async</span><span> </span><span>execute</span><span>(</span><span>args</span><span>, </span><span>context</span><span>) {</span></p></div><div><p><span>    </span><span>// Tool implementation</span></p></div><div><p><span>    </span><span>return</span><span> </span><span>"result"</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>}</span></p></div>
```

___

## [Context](https://opencode.ai/docs/custom-tools/#context)

Tools receive context about the current session:

```
<div><p><span>import</span><span> { tool } </span><span>from</span><span> </span><span>"@opencode-ai/plugin"</span></p></div><div><p><span>export</span><span> </span><span>default</span><span> </span><span>tool</span><span>({</span></p></div><div><p><span><span>  </span></span><span>description: </span><span>"Get project information"</span><span>,</span></p></div><div><p><span><span>  </span></span><span>args: {},</span></p></div><div><p><span>  </span><span>async</span><span> </span><span>execute</span><span>(</span><span>args</span><span>, </span><span>context</span><span>) {</span></p></div><div><p><span>    </span><span>// Access context information</span></p></div><div><p><span>    </span><span>const</span><span> { </span><span>agent</span><span>, </span><span>sessionID</span><span>, </span><span>messageID</span><span> } </span><span>=</span><span> context</span></p></div><div><p><span>    </span><span>return</span><span> </span><span>`Agent: ${</span><span>agent</span><span>}, Session: ${</span><span>sessionID</span><span>}, Message: ${</span><span>messageID</span><span>}`</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>})</span></p></div>
```

___

You can also export multiple tools from a single file. Each export becomes **a
separate tool** with the name **`<filename>_<exportname>`**:

```
<div><p><span>import</span><span> { tool } </span><span>from</span><span> </span><span>"@opencode-ai/plugin"</span></p></div><div><p><span>export</span><span> </span><span>const</span><span> </span><span>add</span><span> </span><span>=</span><span> </span><span>tool</span><span>({</span></p></div><div><p><span><span>  </span></span><span>description: </span><span>"Add two numbers"</span><span>,</span></p></div><div><p><span><span>  </span></span><span>args: {</span></p></div><div><p><span><span>    </span></span><span>a: tool.schema.</span><span>number</span><span>().</span><span>describe</span><span>(</span><span>"First number"</span><span>),</span></p></div><div><p><span><span>    </span></span><span>b: tool.schema.</span><span>number</span><span>().</span><span>describe</span><span>(</span><span>"Second number"</span><span>),</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>async</span><span> </span><span>execute</span><span>(</span><span>args</span><span>) {</span></p></div><div><p><span>    </span><span>return</span><span> args.a </span><span>+</span><span> args.b</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>})</span></p></div><div><p><span>export</span><span> </span><span>const</span><span> </span><span>multiply</span><span> </span><span>=</span><span> </span><span>tool</span><span>({</span></p></div><div><p><span><span>  </span></span><span>description: </span><span>"Multiply two numbers"</span><span>,</span></p></div><div><p><span><span>  </span></span><span>args: {</span></p></div><div><p><span><span>    </span></span><span>a: tool.schema.</span><span>number</span><span>().</span><span>describe</span><span>(</span><span>"First number"</span><span>),</span></p></div><div><p><span><span>    </span></span><span>b: tool.schema.</span><span>number</span><span>().</span><span>describe</span><span>(</span><span>"Second number"</span><span>),</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>async</span><span> </span><span>execute</span><span>(</span><span>args</span><span>) {</span></p></div><div><p><span>    </span><span>return</span><span> args.a </span><span>*</span><span> args.b</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>})</span></p></div>
```

This creates two tools: `math_add` and `math_multiply`.
