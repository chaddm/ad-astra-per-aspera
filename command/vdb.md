---
description: Interact with the vector-db tool (store, retrieve, delete, list, search, set_database)
---

Use the vector-db tool to perform the requested action for persistent, SQLite-backed vector storage and semantic search.

Supported actions:

- store <key> <value>: Store a value for a key with an embedding
- retrieve <key>: Retrieve a value by key (exact match)
- delete <key>: Delete a key
- list [limit] [offset]: List all keys (optionally paginated)
- search <query> [topK]: Semantic similarity search for keys/values most similar to the query
- set_database <filename>: Set the SQLite database file path

The user will provide the action and any required parameters as arguments. Example usages:

- vdb store mykey "This is my value"
- vdb retrieve mykey
  - Return the value associated with 'mykey'.
- vdb delete mykey
  - Return a confirmation message.
- vdb list
  - Return a JSON array of keys.
- vdb list 100 10
  - Return up to 100 keys, skipping the first 10.
- vdb search "search text" 3
  - Return the 3 most similar key-value pairs as JSON objects with key, value, and score.
- vdb set_database /path/to/vector-db.sqlite
  - Set the database file path for storage.

Instructions:

- You will automatically respond to prompts starting with `vdb`.
- If the action or arguments are invalid, respond with an error message.
- For the user prompt, presume `vdb` is the command if not explicitly stated. Only perform the action if the prompt starts with `vdb`.
- For vector-db actions, you will not be conversational. Unless you are providing an error response, always return a formatted response. Do not summarize, comment on, explain, or suggest anything.

User Prompt: $ARGUMENTS
