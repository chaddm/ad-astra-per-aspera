import { tool } from "@opencode-ai/plugin";

// Module-level state for attached server
let attachedUrl: string = "localhost";
let attachedPort: number = 4444;

/**
 * Attach to a running demongrep server by setting the default URL and port.
 * These values will be used by subsequent search calls.
 * Attempts to connect to /health and returns a boolean indicating success.
 */
export const attach = tool({
  description: "Attach to a running demongrep server by setting the default URL and port. Returns a boolean indicating if the connection was successful.",
  args: {
    url: tool.schema.string().optional().describe("Demongrep server host (default: localhost)"),
    port: tool.schema.number().optional().describe("Demongrep server port (default: 4444)"),
  },
  async execute({ url = "localhost", port = 4444 }) {
    attachedUrl = url;
    attachedPort = port;
    let connected = false;
    let message = "";
    try {
      const response = await fetch(`http://${attachedUrl}:${attachedPort}/health`);
      if (response.ok) {
        const data = await response.json();
        if (data && data.status === "ok") {
          connected = true;
          message = `Successfully connected to demongrep server at http://${attachedUrl}:${attachedPort}`;
        } else {
          message = `Server responded but did not return status ok.`;
        }
      } else {
        message = `Server responded with HTTP ${response.status}`;
      }
    } catch (error) {
      message = `Failed to connect: ${error instanceof Error ? error.message : String(error)}`;
    }
    return {
      connected,
      url: attachedUrl,
      port: attachedPort,
      message,
    };
  },
});

/**
 * Search for code or text patterns in files using demongrep HTTP server.
 *
 * This tool sends a POST request to the demongrep server's /search endpoint.
 * The server must be running and indexed. No authentication required for local use.
 *
 * Example usage:
 *   await search.execute({ pattern: "authentication", limit: 40 })
 */
export const search = tool({
  description: "Search for code or text patterns in files using demongrep HTTP server.",
  args: {
    pattern: tool.schema.string().describe("The code or text pattern to search for."),
    limit: tool.schema.number().optional().describe("Maximum number of results to return. Default: 40."),
  },
  async execute({ pattern, limit = 40 }) {
    const host = attachedUrl || "localhost";
    const serverPort = attachedPort || 4444;
    try {
      const response = await fetch(`http://${host}:${serverPort}/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: pattern, limit }),
      });
      if (!response.ok) {
        throw new Error(`Demongrep HTTP error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return {
        error: `Demongrep search failed: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  },
});
