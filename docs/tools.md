---
created: 2025-11-02T21:47:57 (UTC -06:00)
tags: []
source: https://opencode.ai/docs/tools/
author:
---

# Tools | opencode

> ## Excerpt
> Manage the tools an LLM can use.

---
Tools allow the LLM to perform actions in your codebase. OpenCode comes with a set of built-in tools, but you can extend it with [custom tools](https://opencode.ai/docs/custom-tools) or [MCP servers](https://opencode.ai/docs/mcp-servers).

By default, all tools are **enabled** and don’t need permission to run. But you can configure this and control the [permissions](https://opencode.ai/docs/permissions) through your config.

___

## [Configure](https://opencode.ai/docs/tools/#configure)

You can configure tools globally or per agent. Agent-specific configs override global settings.

By default, all tools are set to `true`. To disable a tool, set it to `false`.

___

### [Global](https://opencode.ai/docs/tools/#global)

Disable or enable tools globally using the `tools` option.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"write"</span><span>: </span><span>false</span><span>,</span></p></div><div><p><span>    </span><span>"bash"</span><span>: </span><span>false</span><span>,</span></p></div><div><p><span>    </span><span>"webfetch"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

You can also use wildcards to control multiple tools at once. For example, to disable all tools from an MCP server:

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"mymcp_*"</span><span>: </span><span>false</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

___

### [Per agent](https://opencode.ai/docs/tools/#per-agent)

Override global tool settings for specific agents using the `tools` config in the agent definition.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"write"</span><span>: </span><span>true</span><span>,</span></p></div><div><p><span>    </span><span>"bash"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>"agent"</span><span>: {</span></p></div><div><p><span>    </span><span>"plan"</span><span>: {</span></p></div><div><p><span>      </span><span>"tools"</span><span>: {</span></p></div><div><p><span>        </span><span>"write"</span><span>: </span><span>false</span><span>,</span></p></div><div><p><span>        </span><span>"bash"</span><span>: </span><span>false</span></p></div><div><p><span><span>      </span></span><span>}</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

For example, here the `plan` agent overrides the global config to disable `write` and `bash` tools.

You can also configure tools for agents in Markdown.

```
<div><p><span>---</span></p></div><div><p><span>description</span><span>: </span><span>Read-only analysis agent</span></p></div><div><p><span>mode</span><span>: </span><span>subagent</span></p></div><div><p><span>tools</span><span>:</span></p></div><div><p><span>  </span><span>write</span><span>: </span><span>false</span></p></div><div><p><span>  </span><span>edit</span><span>: </span><span>false</span></p></div><div><p><span>  </span><span>bash</span><span>: </span><span>false</span></p></div><div><p><span>---</span></p></div><div><p><span>Analyze code without making any modifications.</span></p></div>
```

[Learn more](https://opencode.ai/docs/agents#tools) about configuring tools per agent.

___

## [Built-in](https://opencode.ai/docs/tools/#built-in)

Here are all the built-in tools available in OpenCode.

___

### [bash](https://opencode.ai/docs/tools/#bash)

Execute shell commands in your project environment.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"bash"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool allows the LLM to run terminal commands like `npm install`, `git status`, or any other shell command.

___

### [edit](https://opencode.ai/docs/tools/#edit)

Modify existing files using exact string replacements.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"edit"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool performs precise edits to files by replacing exact text matches. It’s the primary way the LLM modifies code.

___

### [write](https://opencode.ai/docs/tools/#write)

Create new files or overwrite existing ones.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"write"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Use this to allow the LLM to create new files. It will overwrite existing files if they already exist.

___

### [read](https://opencode.ai/docs/tools/#read)

Read file contents from your codebase.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"read"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool reads files and returns their contents. It supports reading specific line ranges for large files.

___

### [grep](https://opencode.ai/docs/tools/#grep)

Search file contents using regular expressions.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"grep"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Fast content search across your codebase. Supports full regex syntax and file pattern filtering.

___

### [glob](https://opencode.ai/docs/tools/#glob)

Find files by pattern matching.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"glob"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Search for files using glob patterns like `**/*.js` or `src/**/*.ts`. Returns matching file paths sorted by modification time.

___

### [list](https://opencode.ai/docs/tools/#list)

List files and directories in a given path.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"list"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool lists directory contents. It accepts glob patterns to filter results.

___

### [patch](https://opencode.ai/docs/tools/#patch)

Apply patches to files.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"patch"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool applies patch files to your codebase. Useful for applying diffs and patches from various sources.

___

### [todowrite](https://opencode.ai/docs/tools/#todowrite)

Manage todo lists during coding sessions.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"todowrite"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Creates and updates task lists to track progress during complex operations. The LLM uses this to organize multi-step tasks.

___

### [todoread](https://opencode.ai/docs/tools/#todoread)

Read existing todo lists.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"todoread"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Reads the current todo list state. Used by the LLM to track what tasks are pending or completed.

___

### [webfetch](https://opencode.ai/docs/tools/#webfetch)

Fetch web content.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"webfetch"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Allows the LLM to fetch and read web pages. Useful for looking up documentation or researching online resources.

___

### [horology](https://opencode.ai/docs/tools/#horology)

Provides time-related functionality with human-readable formatted output.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"horology"</span><span>: </span><span>true</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

This tool provides the `get_current_date_and_time` function that returns the current local date and time in a human-readable format. It takes no parameters and returns the current local time formatted as: `<day-of-week> the <day number><st|nd|rd|th> of <month>, <year> at <hour>:<min>:<sec>.<hundredths> <AM|PM>.`

**Example output:** "Sunday the 9th of November, 2025 at 3:45:12.34 PM."

___

Custom tools let you define your own functions that the LLM can call. These are defined in your config file and can execute arbitrary code.

[Learn more](https://opencode.ai/docs/custom-tools) about creating custom tools.

___

## [MCP servers](https://opencode.ai/docs/tools/#mcp-servers)

MCP (Model Context Protocol) servers allow you to integrate external tools and services. This includes database access, API integrations, and third-party services.

[Learn more](https://opencode.ai/docs/mcp-servers) about configuring MCP servers.

___

## [Internals](https://opencode.ai/docs/tools/#internals)

Internally, tools like `grep`, `glob`, and `list` use [ripgrep](https://github.com/BurntSushi/ripgrep) under the hood. By default, ripgrep respects `.gitignore` patterns, which means files and directories listed in your `.gitignore` will be excluded from searches and listings.

___

### [Ignore patterns](https://opencode.ai/docs/tools/#ignore-patterns)

To include files that would normally be ignored, create a `.ignore` file in your project root. This file can explicitly allow certain paths.

```
<div><p><span>!node_modules/</span></p></div><div><p><span>!dist/</span></p></div><div><p><span>!build/</span></p></div>
```

For example, this `.ignore` file allows ripgrep to search within `node_modules/`, `dist/`, and `build/` directories even if they’re listed in `.gitignore`.
