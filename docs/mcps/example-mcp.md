---
Title: Example MCP
ID: example-mcp
Version: 1.0
Added: 2025-11-06
Added-by: mcp-builder
---

# Example MCP

A small example MCP that demonstrates the recommended markdown format for storing MCP
configuration and usage notes.

## Basic configuration

```json
{
  "host": "mcp.example.com",
  "port": 443,
  "protocol": "https",
  "api_key_env": "EXAMPLE_MCP_API_KEY"
}
```

## Switches / Flags

- `--no-verify` — skip TLS verification (dev only)
- `--log-level` — one of `info`, `debug`, `warn`

## Parameters

- `timeout` — request timeout in seconds (default: 30)
- `max_concurrency` — maximum concurrent requests (default: 4)

## Environment variables

- `EXAMPLE_MCP_API_KEY` — API key for authenticating to the MCP (store in keyring or protected env)
- `EXAMPLE_MCP_HOST` — override host (optional)

## Example invocation

```bash
# Run client with env vars from a protected store (do not commit secrets)
export EXAMPLE_MCP_API_KEY="$EXAMPLE_MCP_API_KEY"
EXAMPLE_MCP_HOST=mcp.example.com my-mcp-client --api-key-env EXAMPLE_MCP_API_KEY --timeout 30
```

## Notes

This example demonstrates how the `mcp-builder` subagent will generate and present
MCP documentation. Secrets should not be written into the markdown file itself. Use
environment variables or OS keyrings instead.
