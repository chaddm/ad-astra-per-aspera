# Vector Feature Design Document

## Overview

The Vector feature introduces a new capability to opencode, enabling advanced
vector-based operations such as semantic search, similarity matching, and embedding
management. This feature will be implemented as an opencode tool, agent, and command,
providing a seamless interface for users and agents to leverage vector functionality
within their workflows.

## Goals

- Enable vector-based search and retrieval in opencode projects
- Provide a reusable tool for embedding and similarity operations
- Create an agent for orchestrating complex vector workflows
- Offer a command for easy invocation of vector operations from the TUI

## Architecture

The feature consists of three main components:

- **Tool:** Implements core vector operations (e.g., embedding, similarity search)
  using Orama as the default vector database engine. Orama provides fast, local-first
  semantic search, disk persistence via plugins, and extensible schema support.
- **Agent:** Orchestrates vector workflows, exposes high-level actions, and
  coordinates with other agents/tools
- **Command:** Provides a user-facing shortcut to trigger vector operations via the
  TUI

The tool will be accessible to agents and commands, while the agent will expose
specialized workflows and coordinate with the tool. The command will invoke the agent
or tool as needed, providing a simple interface for users.

### Orama Engine Integration
- Orama is used for all vector database operations, including indexing, search, and persistence.
- Supports local-only operation (no cloud required), disk persistence, and plugin-based embeddings.
- Schema is defined per Orama’s API, with a dedicated vector field for embeddings.
- Plugins for embeddings and persistence are configurable, supporting Node.js and Bun environments.
- For more details, see [Orama Docs](https://orama.dev/docs/introduction) and [Orama Plugins](https://orama.dev/docs/plugins/overview).


## 1. Opencode Tool: `vector-db`
### Purpose
`vector-db` provides fast semantic search over markdown files in the `pages/` directory using a vector database/index. It enables agents and commands to perform semantic lookups, making it easy to find relevant content based on meaning rather than keywords.

### API Design
The tool exposes the following function calls, implemented using Orama’s API:

- **`reindex()`**
  - Uses Orama to evict current vector data and rebuild the index by crawling the `pages/` directory for markdown files.
  - Defines schema with a vector field for embeddings.
  - Supports plugin-based disk persistence and embeddings.
  - Returns a summary of indexed files and status.
  - Example signature:
    ```typescript
    async function reindex(): Promise<{ indexedFiles: string[], status: string }>
    ```
  - Orama example:
    ```js
    import { create } from 'orama';
    import { leveldbPersistence } from '@orama/plugin-persistence-leveldb';
    const db = await create({
      schema: { id: 'string', content: 'string', embedding: 'vector[384]' },
      plugins: [leveldbPersistence({ path: './db' })]
    });
    ```

- **`find(queries: string[] | string, options?: object)`**
  - Accepts one or more search strings.
  - Uses Orama’s vector search API, supporting options like topK, similarity threshold, and vector property.
  - Returns a ranked list of results (file, snippet, score).
  - Example signature:
    ```typescript
    async function find(queries: string[] | string, options?: object): Promise<Array<{ file: string, snippet: string, score: number }>>
    ```
  - Orama example:
    ```js
    import { search } from 'orama';
    const results = await search(db, {
      term: 'test',
      vector: [0.1, 0.2, 0.3, ...],
      threshold: 0.8,
      limit: 10
    });
    ```

- **`clear()`**
  - Uses Orama to clear all stored vector data and stop any indexing/search processes.
  - Returns a status message.
  - Example signature:
    ```typescript
    async function clear(): Promise<{ status: string }>
    ```
  - Orama example:
    ```js
    // Re-initialize or drop the database instance
    db = await create({ schema: { ... } });
    ```


### Configuration & Integration
- Orama is the default vector engine, supporting local-only operation and disk persistence via plugins.
- Embeddings can be generated using Orama’s plugin system (e.g., OpenAI, local models).
- Permissions and configuration follow opencode tool patterns (see [docs/tools.md]).
- The tool allows configuration of engine-specific options, such as:
  - `topK`: Number of top results to return
  - `threshold`: Similarity threshold for vector search
  - `diskPath`: Path for disk persistence plugin
  - `embeddingPlugin`: Embeddings plugin configuration
- Node.js and Bun are supported; plugin installation may differ (see Orama docs).
- For more details, see [Orama Plugins](https://orama.dev/docs/plugins/overview).

### Implementation Plan
- Install Orama and required plugins:
  - `npm install orama @orama/plugin-persistence-leveldb @orama/plugin-embeddings`
- Define tool API and configuration schema using Orama’s schema and plugin system
- Implement core vector functions (`reindex`, `find`, `clear`) using Orama’s API
- Configure disk persistence and embeddings plugins for local operation
- Add tests for each function, including plugin configuration and disk persistence
- Document usage, configuration, and engine selection (Orama as default, pluggable for future engines)
- Provide code examples for Orama setup, data insertion, search, and persistence

## 2. Opencode Agent
### Purpose
Coordinates vector workflows, exposes high-level actions (e.g., semantic search, batch embedding), and integrates with other agents/tools.

### Design
- Configuration: Agent mode (primary/subagent), model, tool access (see [docs/agents.md])
- Responsibilities: Orchestrate vector operations, handle user requests, manage workflow state

### Integration
Refer to [docs/agents.md] for:
- Agent configuration and YAML/Markdown frontmatter
- Tool access control
- Best practices for agent design and registration

### Implementation Plan
- Create agent configuration file in `agent/`
- Specify model, mode, and tool access
- Implement agent logic for vector workflows
- Register agent and update opencode.json
- Document agent usage and restart requirements

## 3. Opencode Command
### Purpose
Provides a user-facing shortcut to trigger vector operations (e.g., `/vector-search <query>`), automating common tasks and workflows.

### Design
- Command file format: Markdown with YAML frontmatter (see [docs/commands.md])
- Arguments: Support for dynamic input (e.g., search query)
- Agent invocation: Specify agent if needed

### Integration
Refer to [docs/commands.md] for:
- Command file structure and naming conventions
- Frontmatter options (description, agent, model, subtask)
- Best practices for command creation and error handling

### Implementation Plan
- Create command file in `command/` (e.g., `vector-search.md`)
- Define frontmatter and prompt template
- Test command invocation and argument handling
- Document command usage and troubleshooting

## Testing & Validation
- Unit tests for tool functions using Orama’s API
- Integration tests for agent workflows, including plugin configuration and disk persistence
- End-to-end tests for command invocation and semantic search
- Manual validation of TUI interactions
- Test cases for Node.js and Bun environments

## References
- [docs/agents.md]
- [docs/tools.md]
- [docs/commands.md]
- [Orama Docs](https://orama.dev/docs/introduction)
- [Orama NPM](https://www.npmjs.com/package/orama)
- [Orama GitHub](https://github.com/orama-index/orama)
- [Orama Plugins](https://orama.dev/docs/plugins/overview)
- [Persistence Plugin](https://orama.dev/docs/plugins/persistence)
- [Embeddings Plugin](https://orama.dev/docs/plugins/embeddings)

---

This design document provides a comprehensive plan for implementing the Vector feature in opencode, ensuring alignment with existing architecture and best practices. Each component references the appropriate documentation for further details and integration guidance.
