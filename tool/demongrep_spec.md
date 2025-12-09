# demongrep Tool Specification

## Feature: Auto-Spawn demongrep Server for Search

### 1. Port Management

- When `search` is called and not attached:
  - Scan ports 4444–4480 on `127.0.0.1` to find an unused one (by attempting to bind
    using the `net` module).
  - Use the first available port.
  - Use the built-in `net` module for binding. This approach works on macOS, Node.js,
    and Bun.

#### Example (Node.js/Bun):

```js
import net from "net";
async function checkPort(port, host = "127.0.0.1") {
  return new Promise((resolve, reject) => {
    const server = net
      .createServer()
      .once("error", (err) => {
        if (err.code === "EADDRINUSE") resolve(false);
        else reject(err);
      })
      .once("listening", () => {
        server.close(() => resolve(true));
      })
      .listen(port, host);
  });
}
```

### 2. Server Lifecycle

- **Spawn:**
  - Launch `demongrep serve --port <port>` as a background process.
    - Prefer `bun` for spawning; fall back to `node` if `bun` is not available.
    - Use `Bun.spawn` or Node.js `child_process.spawn` as appropriate.
  - Store the process handle and mark the server as “internally managed.”
  - Poll `http://127.0.0.1:<port>/health` every 500ms, up to 15 seconds.
    - Wait for a JSON response with `"status": "ready"`.
    - Only proceed when status is `"ready"` (not just responding).
    - Timeout after 15 seconds with an error if not ready.

#### Example (Process Management):

```js
// Node.js
const { spawn } = require("child_process");
const child = spawn("demongrep", ["serve", "--port", "4444"], { detached: true });
// Bun
const proc = Bun.spawn({
  cmd: ["demongrep", "serve", "--port", "4444"],
  detached: true,
});
// Cleanup
process.on("exit", () => {
  if (!child.killed) child.kill("SIGTERM");
});
```

#### Example (Polling):

```js
async function pollEndpoint(url, interval = 500, timeout = 15000) {
  const controller = new AbortController();
  let timeoutId,
    intervalId,
    isDone = false;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => {
      controller.abort();
      reject(new Error("Polling timed out"));
    }, timeout);
  });
  const poll = async () => {
    try {
      const response = await fetch(url, { signal: controller.signal });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      if (data.status === "ready") {
        isDone = true;
        clearTimeout(timeoutId);
        clearInterval(intervalId);
        return data;
      }
    } catch (err) {
      /* handle error */
    }
  };
  return Promise.race([
    timeoutPromise,
    new Promise((resolve) => {
      intervalId = setInterval(async () => {
        if (isDone) return;
        const result = await poll();
        if (result) resolve(result);
      }, interval);
      poll().then((result) => {
        if (result) resolve(result);
      });
    }),
  ]);
}
```

- **Track:**

  - Only one internal server at a time.
  - Store process handle and port in module-level variables.
  - Use module-level flags or mutexes to prevent race conditions (see below).

- **Attach:**
  - If an internal server is running, terminate it before switching to the external
    server.
  - Update `attachedUrl` and `attachedPort` to the new values.

### 3. Search Behavior

- If attached to a server (internal or external), use it.
- If not attached, auto-spawn the internal server as above, then perform the search.

### 4. Cleanup

- Ensure the internal server process is terminated:
  - When `attach` is called to switch to an external server.
  - On process exit (register a cleanup handler with `process.on('exit')`, `SIGINT`,
    `SIGTERM`).

### 5. Concurrency

- Only one internal server at a time.
- Multiple concurrent search requests are supported and should be handled gracefully.
  No need to queue or reject requests; the tool must be thread-safe and support
  parallel searches.
- Use module-level flags or async mutexes for concurrency control if needed.

#### Example (Singleton State):

```js
let serverProcess = null,
  isStarting = false;
async function startServer() {
  if (serverProcess) return serverProcess;
  if (isStarting) {
    while (isStarting) await new Promise((r) => setTimeout(r, 10));
    return serverProcess;
  }
  isStarting = true;
  // ... start logic ...
  isStarting = false;
  return serverProcess;
}
```

### 6. Logging

- No logging or status endpoints are required. The tool should operate silently
  except for error reporting.

---

## demongrep HTTP Server API

### Endpoints

- **GET /health**
  - Health check. Returns `{ "status": "ok" }` or `{ "status": "ready", ... }` when
    indexing is complete.
- **GET /status**
  - Returns index statistics.
- **POST /search**
  - Performs a semantic code search.

### Search Endpoint Details

- **URL:** `http://localhost:<port>/search` (default port: 4444)
- **Request Format:**
  - Method: POST
  - Content-Type: application/json
  - Body:
    ```json
    {
      "query": "your search query",
      "limit": 40
    }
    ```
- **Response Format:**
  ```json
  {
    "results": [
      {
        "path": "src/auth/handler.rs",
        "start_line": 45,
        "end_line": 67,
        "kind": "Function",
        "content": "pub fn authenticate(...) { ... }",
        "score": 0.89,
        "signature": "fn authenticate(credentials: &Credentials) -> Result<User>"
      }
    ],
    "query": "authentication",
    "total_results": 1
  }
  ```
- **No authentication required** for local HTTP API.

### Health Endpoint Details

- **URL:** `http://localhost:<port>/health`
- **Response:**
  ```json
  {
    "status": "ready",
    "indexed_files": 91,
    "indexed_chunks": 495,
    "model": "minilm-l6-q"
  }
  ```
  - Only proceed when `status` is `"ready"`.

---

## Current demongrep Tool API

### attach

- **Purpose:** Attach to a running demongrep server by setting the default URL and
  port. Returns a boolean indicating if the connection was successful.
- **Arguments:**
  - `url`: string (optional, default: "localhost")
  - `port`: number (optional, default: 4444)
- **Behavior:**
  - Sets module-level `attachedUrl` and `attachedPort`.
  - Attempts to connect to `/health` endpoint.
  - Returns:
    - `connected`: boolean
    - `url`: string
    - `port`: number
    - `message`: string

#### Example (Check if demongrep is available):

```js
function isDemongrepAvailable() {
  if (typeof Bun !== "undefined" && Bun.which) {
    return Bun.which("demongrep") !== null;
  } else {
    const { spawnSync } = require("child_process");
    const cmd = process.platform === "win32" ? "where" : "command";
    const args = process.platform === "win32" ? ["demongrep"] : ["-v", "demongrep"];
    const result = spawnSync(cmd, args, { stdio: "ignore" });
    return result.status === 0;
  }
}
```

### search

- **Purpose:** Search for code or text patterns in files using demongrep HTTP server.
- **Arguments:**
  - `pattern`: string (required)
  - `limit`: number (optional, default: 40)
- **Behavior:**
  - Uses `attachedUrl` and `attachedPort` (default: localhost:4444).
  - Sends POST request to `/search` endpoint with `{ query: pattern, limit }`.
  - Returns parsed JSON response from server.

---

## Implementation Notes

- Use MacOS- and Linux-compatible CLI tools for port scanning (e.g., try connecting
  to each port with `net` module). Windows support is not required.
- Use `Bun.spawn` if available, otherwise use Node.js `child_process.spawn`.
- All process management and polling should be asynchronous.
- Use module-level variables for singleton state and concurrency flags.
- Register cleanup handlers for process exit (`process.on('exit')`, `SIGINT`,
  `SIGTERM`).
- Return clear, natural language error messages for timeouts, process failures, or
  missing binaries. Errors should be suitable for LLMs to relay to users.
- The module style (ESM/CommonJS) must match the existing tool code for compatibility
  and consistency.
- No need for persistent logs or status reporting.

---

## Updated Next Steps

1. **Implement Port Scanning Utility**

   - [ ] All code should be written as a single block within the tool file (no
         separate module structure).
   - [ ] Import the net module using `import net from 'net'` (ESM) or
         `const net = require('net')` (CommonJS).
   - [ ] Define port range and host: `PORT_START = 4444`, `PORT_END = 4480`,
         `HOST = '127.0.0.1'`.
   - [ ] Implement async port scanning logic:
     - [ ] Iterate through the port range.
     - [ ] Attempt to bind to each port using
           `net.createServer().listen(port, host)`.
     - [ ] On success, close the server and return the port.
     - [ ] On `EADDRINUSE` or `EACCES`, skip to next port.
     - [ ] On other errors, throw/rethrow.
     - [ ] If all ports fail, throw a clear error.
   - [ ] Handle errors and edge cases:
     - [ ] Permission errors (`EACCES`).
     - [ ] All ports in use.
     - [ ] Unexpected exceptions.
     - [ ] Ensure server is always closed after each attempt.
   - [ ] Document concurrency considerations:
     - [ ] Warn about possible race conditions if used concurrently in the same
           process.
     - [ ] (Optional) Implement a lock/mutex for advanced use.
   - [ ] Write tests:
     - [ ] Test: finds available port in range.
     - [ ] Test: throws error if all ports in use.
     - [ ] Test: handles permission errors gracefully.
     - [ ] Test: works in both Node.js and Bun.
   - [ ] Provide usage examples and documentation as comments or README section.

2. **Implement Async Process Spawning with Bun/Node Fallback**

   - Prefer `Bun.spawn` if available, otherwise use Node.js `child_process.spawn`.
   - Ensure process handle is tracked and can be terminated.
   - Check for the `demongrep` binary in PATH using `Bun.which` or `command -v`.

3. **Implement Health Polling with Status Check and Timeout**

   - Poll `http://127.0.0.1:<port>/health` every 500ms, up to 15 seconds.
   - Only proceed when JSON response contains `"status": "ready"`.
   - Abort and return a clear error if timeout is reached.

4. **Implement Internal Server Lifecycle Management**

   - Use module-level variables for process handle, port, and state flags
     (`isStarting`, `isRunning`).
   - Ensure only one internal server is running at a time.
   - Register cleanup handlers for process exit (`process.on('exit')`, `SIGINT`,
     `SIGTERM`).
   - Terminate the internal server when switching to an external server via `attach`.

5. **Integrate with `search` and `attach`**

   - `search`: If not attached, auto-spawn server and wait for ready status before
     searching.
   - `attach`: If internal server is running, terminate it before updating to new
     server.

6. **Implement Error Handling and User Feedback**

   - Return clear, natural language error messages for:
     - Port scanning failures
     - Missing `demongrep` binary
     - Process spawn failures
     - Health polling timeouts
     - Search/attach failures
   - Errors should be suitable for LLMs to relay to users.

7. **Testing**
   - Write tests for port scanning, process management, health polling, and API
     integration.
   - Mock child processes and HTTP endpoints as needed.
