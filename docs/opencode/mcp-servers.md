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

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "name-of-mcp-server": {
      // ...
      "enabled": true,
    },
    "name-of-other-mcp-server": {
      // ...
    },
  },
}
```

You can also disable a server by setting `enabled` to `false`. This is useful if you want to temporarily disable a server without removing it from your config.

___

### [Local](https://opencode.ai/docs/mcp-servers#local)

Add local MCP servers using `type` to `"local"` within the MCP object.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-local-mcp-server": {
      "type": "local",
      // Or ["bun", "x", "my-mcp-command"]
      "command": ["npx", "-y", "my-mcp-command"],
      "enabled": true,
      "environment": {
        "MY_ENV_VAR": "my_env_var_value",
      },
    },
  },
}
```

The command is how the local MCP server is started. You can also pass in a list of environment variables as well.

For example, here's how I can add the test [`@modelcontextprotocol/server-everything`](https://www.npmjs.com/package/@modelcontextprotocol/server-everything) MCP server.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "mcp_everything": {
      "type": "local",
      "command": ["npx", "-y", "@modelcontextprotocol/server-everything"],
    },
  },
}
```

And to use it I can add `use the mcp_everything tool` to my prompts.

```
use the mcp_everything tool to add the number 3 and 4
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

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-remote-mcp": {
      "type": "remote",
      "url": "https://my-mcp-server.com",
      "enabled": true,
      "headers": {
        "Authorization": "Bearer MY_API_KEY"
      }
    }
  }
}
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

Your MCPs are available as tools in OpenCode, alongside built-in tools. You can manage them through the OpenCode `permission` config like any other tool.

**Note:** As of OpenCode v1.1.1, the legacy `tools` configuration has been deprecated and merged into the `permission` system.

___

### [Global](https://opencode.ai/docs/mcp-servers#global)

This means that you can control permissions for them globally using the `permission` config.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-mcp-foo": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command-foo"]
    },
    "my-mcp-bar": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command-bar"]
    }
  },
  "permission": {
    "my-mcp-foo": "deny"
  }
}
```

We can also use a glob pattern to deny all matching MCPs.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-mcp-foo": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command-foo"]
    },
    "my-mcp-bar": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command-bar"]
    }
  },
  "permission": {
    "my-mcp*": "deny"
  }
}
```

Here we are using the glob pattern `my-mcp*` to deny all MCPs.

___

### [Per agent](https://opencode.ai/docs/mcp-servers#per-agent)

If you have a large number of MCP servers you may want to only enable them per agent and disable them globally. To do this:

1.  Deny permission globally.
2.  In your [agent config](https://opencode.ai/docs/agents#permissions) allow the MCP server permission.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "my-mcp": {
      "type": "local",
      "command": ["bun", "x", "my-mcp-command"],
      "enabled": true
    }
  },
  "permission": {
    "my-mcp*": "deny"
  },
  "agent": {
    "my-agent": {
      "permission": {
        "my-mcp*": "allow"
      }
    }
  }
}
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

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp"
    }
  }
}
```

If you have signed up for a free account, you can use your API key and get higher rate-limits.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "context7": {
      "type": "remote",
      "url": "https://mcp.context7.com/mcp",
      "headers": {
        "CONTEXT7_API_KEY": "{env:CONTEXT7_API_KEY}"
      }
    }
  }
}
```

Here we are assuming that you have the `CONTEXT7_API_KEY` environment variable set.

Add `use context7` to your prompts to use Context7 MCP server.

```
Configure a Cloudflare Worker script to cache JSON API responses for five minutes. use context7
```

Alternatively, you can add something like this to your [AGENTS.md](https://opencode.ai/docs/rules/).

```
When you need to search docs, use `context7` tools.
```

___

### [Grep by Vercel](https://opencode.ai/docs/mcp-servers#grep-by-vercel)

Add the [Grep by Vercel](https://grep.app/) MCP server to search through code snippets on GitHub.

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "gh_grep": {
      "type": "remote",
      "url": "https://mcp.grep.app"
    }
  }
}
```

Since we named our MCP server `gh_grep`, you can add `use the gh_grep tool` to your prompts to get the agent to use it.

```
What's the right way to set a custom domain in an SST Astro component? use the gh_grep tool
```

Alternatively, you can add something like this to your [AGENTS.md](https://opencode.ai/docs/rules/).

```
If you are unsure how to do something, use `gh_grep` to search code examples from github.
```
