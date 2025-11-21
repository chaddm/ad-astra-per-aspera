---
created: 2025-11-02T21:49:36 (UTC -06:00)
tags: []
source: https://opencode.ai/docs/mcp-servers
author:
---

# MCP servers | opencode

> ## Excerpt
> Add local and remote MCP tools.

---
You can add external tools to OpenCode using the _Model Context Protocol_, or MCP.

OpenCode supports both:

-   Local servers
-   Remote servers

Once added, MCP tools are automatically available to the LLM alongside built-in tools.

___

## [Caveats](https://opencode.ai/docs/mcp-servers#caveats)

When you use an MCP server, it adds to the context. This can quickly add up if you have a lot of tools. So we recommend being careful with which MCP servers you use.

Certain MCP servers, like the GitHub MCP server tend to add a lot of tokens and can easily exceed the context limit.

___

## [Configure](https://opencode.ai/docs/mcp-servers#configure)

You can define MCP servers in your OpenCode config under `mcp`. Add each MCP with a unique name. You can refer to that MCP by name when prompting the LLM.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"name-of-mcp-server"</span><span>: {</span></p></div><div><p><span>      </span><span>// ...</span></p></div><div><p><span>      </span><span>"enabled"</span><span>: </span><span>true</span><span>,</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span>    </span><span>"name-of-other-mcp-server"</span><span>: {</span></p></div><div><p><span>      </span><span>// ...</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>}</span></p></div>
```

You can also disable a server by setting `enabled` to `false`. This is useful if you want to temporarily disable a server without removing it from your config.

___

### [Local](https://opencode.ai/docs/mcp-servers#local)

Add local MCP servers using `type` to `"local"` within the MCP object.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-local-mcp-server"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>// Or ["bun", "x", "my-mcp-command"]</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"npx"</span><span>, </span><span>"-y"</span><span>, </span><span>"my-mcp-command"</span><span>],</span></p></div><div><p><span>      </span><span>"enabled"</span><span>: </span><span>true</span><span>,</span></p></div><div><p><span>      </span><span>"environment"</span><span>: {</span></p></div><div><p><span>        </span><span>"MY_ENV_VAR"</span><span>: </span><span>"my_env_var_value"</span><span>,</span></p></div><div><p><span><span>      </span></span><span>},</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>}</span></p></div>
```

The command is how the local MCP server is started. You can also pass in a list of environment variables as well.

For example, here’s how I can add the test [`@modelcontextprotocol/server-everything`](https://www.npmjs.com/package/@modelcontextprotocol/server-everything) MCP server.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"mcp_everything"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"npx"</span><span>, </span><span>"-y"</span><span>, </span><span>"@modelcontextprotocol/server-everything"</span><span>],</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>}</span></p></div>
```

And to use it I can add `use the mcp_everything tool` to my prompts.

```
<div><p><span>use the </span><mark><span>mcp_everything</span></mark><span> tool to add the number 3 and 4</span></p></div>
```

#### [Options](https://opencode.ai/docs/mcp-servers#options)

Here are all the options for configuring a local MCP server.

| Option        | Type    | Required | Description                                                                         |
| ------------- | ------- | -------- | ----------------------------------------------------------------------------------- |
| `type`        | String  | Y        | Type of MCP server connection, must be `"local"`.                                   |
| `command`     | Array   | Y        | Command and arguments to run the MCP server.                                        |
| `environment` | Object  |          | Environment variables to set when running the server.                               |
| `enabled`     | Boolean |          | Enable or disable the MCP server on startup.                                        |
| `timeout`     | Number  |          | Timeout in ms for fetching tools from the MCP server. Defaults to 5000 (5 seconds). |

___

### [Remote](https://opencode.ai/docs/mcp-servers#remote)

Add remote MCP servers under by setting `type` to `"remote"`.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-remote-mcp"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"remote"</span><span>,</span></p></div><div><p><span>      </span><span>"url"</span><span>: </span><span>"https://my-mcp-server.com"</span><span>,</span></p></div><div><p><span>      </span><span>"enabled"</span><span>: </span><span>true</span><span>,</span></p></div><div><p><span>      </span><span>"headers"</span><span>: {</span></p></div><div><p><span>        </span><span>"Authorization"</span><span>: </span><span>"Bearer MY_API_KEY"</span></p></div><div><p><span><span>      </span></span><span>}</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Here the `url` is the URL of the remote MCP server and with the `headers` option you can pass in a list of headers.

#### [Options](https://opencode.ai/docs/mcp-servers#options-1)

| Option    | Type    | Required | Description                                                                         |
| --------- | ------- | -------- | ----------------------------------------------------------------------------------- |
| `type`    | String  | Y        | Type of MCP server connection, must be `"remote"`.                                  |
| `url`     | String  | Y        | URL of the remote MCP server.                                                       |
| `enabled` | Boolean |          | Enable or disable the MCP server on startup.                                        |
| `headers` | Object  |          | Headers to send with the request.                                                   |
| `timeout` | Number  |          | Timeout in ms for fetching tools from the MCP server. Defaults to 5000 (5 seconds). |

___

## [Manage](https://opencode.ai/docs/mcp-servers#manage)

Your MCPs are available as tools in OpenCode, alongside built-in tools. So you can manage them through the OpenCode config like any other tool.

___

### [Global](https://opencode.ai/docs/mcp-servers#global)

This means that you can enable or disable them globally.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp-foo"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"bun"</span><span>, </span><span>"x"</span><span>, </span><span>"my-mcp-command-foo"</span><span>]</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span>    </span><span>"my-mcp-bar"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"bun"</span><span>, </span><span>"x"</span><span>, </span><span>"my-mcp-command-bar"</span><span>]</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp-foo"</span><span>: </span><span>false</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

We can also use a glob pattern to disable all matching MCPs.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp-foo"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"bun"</span><span>, </span><span>"x"</span><span>, </span><span>"my-mcp-command-foo"</span><span>]</span></p></div><div><p><span><span>    </span></span><span>},</span></p></div><div><p><span>    </span><span>"my-mcp-bar"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"bun"</span><span>, </span><span>"x"</span><span>, </span><span>"my-mcp-command-bar"</span><span>]</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp*"</span><span>: </span><span>false</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Here we are using the glob pattern `my-mcp*` to disable all MCPs.

___

### [Per agent](https://opencode.ai/docs/mcp-servers#per-agent)

If you have a large number of MCP servers you may want to only enable them per agent and disable them globally. To do this:

1.  Disable it as a tool globally.
2.  In your [agent config](https://opencode.ai/docs/agents#tools) enable the MCP server as a tool.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"local"</span><span>,</span></p></div><div><p><span>      </span><span>"command"</span><span>: [</span><span>"bun"</span><span>, </span><span>"x"</span><span>, </span><span>"my-mcp-command"</span><span>],</span></p></div><div><p><span>      </span><span>"enabled"</span><span>: </span><span>true</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>"tools"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-mcp*"</span><span>: </span><span>false</span></p></div><div><p><span><span>  </span></span><span>},</span></p></div><div><p><span>  </span><span>"agent"</span><span>: {</span></p></div><div><p><span>    </span><span>"my-agent"</span><span>: {</span></p></div><div><p><span>      </span><span>"tools"</span><span>: {</span></p></div><div><p><span>        </span><span>"my-mcp*"</span><span>: </span><span>true</span></p></div><div><p><span><span>      </span></span><span>}</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

___

#### [Glob patterns](https://opencode.ai/docs/mcp-servers#glob-patterns)

The glob pattern uses simple regex globbing patterns.

-   `*` matches zero or more of any character
-   `?` matches exactly one character
-   All other characters match literally

___

## [Examples](https://opencode.ai/docs/mcp-servers#examples)

Below are examples of some common MCP servers. You can submit a PR if you want to document other servers.

___

### [Context7](https://opencode.ai/docs/mcp-servers#context7)

Add the [Context7 MCP server](https://github.com/context-labs/mcp-server-context7) to search through docs.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"context7"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"remote"</span><span>,</span></p></div><div><p><span>      </span><span>"url"</span><span>: </span><span>"https://mcp.context7.com/mcp"</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

If you have signed up for a free account, you can use your API key and get higher rate-limits.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"context7"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"remote"</span><span>,</span></p></div><div><p><span>      </span><span>"url"</span><span>: </span><span>"https://mcp.context7.com/mcp"</span><span>,</span></p></div><div><p><span>      </span><span>"headers"</span><span>: {</span></p></div><div><p><span>        </span><span>"CONTEXT7_API_KEY"</span><span>: </span><span>"{env:CONTEXT7_API_KEY}"</span></p></div><div><p><span><span>      </span></span><span>}</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Here we are assuming that you have the `CONTEXT7_API_KEY` environment variable set.

Add `use context7` to your prompts to use Context7 MCP server.

```
<div><p><span>Configure a Cloudflare Worker script to cache JSON API responses for five minutes. </span><mark><span>use context7</span></mark></p></div>
```

Alternatively, you can add something like this to your [AGENTS.md](https://opencode.ai/docs/rules/).

```
<div><p><span>When you need to search docs, use </span><span>`context7`</span><span> tools.</span></p></div>
```

___

### [Grep by Vercel](https://opencode.ai/docs/mcp-servers#grep-by-vercel)

Add the [Grep by Vercel](https://grep.app/) MCP server to search through code snippets on GitHub.

```
<div><p><span>{</span></p></div><div><p><span>  </span><span>"$schema"</span><span>: </span><span>"https://opencode.ai/config.json"</span><span>,</span></p></div><div><p><span>  </span><span>"mcp"</span><span>: {</span></p></div><div><p><span>    </span><span>"gh_grep"</span><span>: {</span></p></div><div><p><span>      </span><span>"type"</span><span>: </span><span>"remote"</span><span>,</span></p></div><div><p><span>      </span><span>"url"</span><span>: </span><span>"https://mcp.grep.app"</span></p></div><div><p><span><span>    </span></span><span>}</span></p></div><div><p><span><span>  </span></span><span>}</span></p></div><div><p><span>}</span></p></div>
```

Since we named our MCP server `gh_grep`, you can add `use the gh_grep tool` to your prompts to get the agent to use it.

```
<div><p><span>What's the right way to set a custom domain in an SST Astro component? </span><mark><span>use the gh_grep tool</span></mark></p></div>
```

Alternatively, you can add something like this to your [AGENTS.md](https://opencode.ai/docs/rules/).

```
<div><p><span>If you are unsure how to do something, use </span><span>`gh_grep`</span><span> to search code examples from github.</span></p></div>
```
