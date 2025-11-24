---
description: Interact with the vector-db tool (store, retrieve, delete, list, search, set_database)
---

Use the vector-db tool to perform the requested action for persistent, SQLite-backed vector storage and semantic search.

Supported actions:

- store <embedding_text> <value>: Store a value for an embedding_text with an embedding. Returns a UUID key.
- retrieve <key>: Retrieve a value by UUID key (exact match)
- delete <key>: Delete a row by UUID key
- list [limit] [offset]: List all rows (optionally paginated). Returns objects with key, embedding_text, value, and embedding.
- search <query> [topK]: Semantic similarity search for rows most similar to the query. Returns objects with key, embedding_text, value, and score.
- set_database <filename>: Set the SQLite database file path

The user will provide the action and any required parameters as arguments. Example usages:

- vdb store "apple computer" "fruit company / hardware vendor"
  - Returns: a UUID key (e.g., "a1b2c3d4-...-e5f6")
- vdb retrieve a1b2c3d4-...-e5f6
  - Returns: the value associated with the UUID key
- vdb delete a1b2c3d4-...-e5f6
  - Returns: the deleted UUID key
- vdb list
  - Returns: a JSON array of objects with key, embedding_text, value, and embedding
- vdb list 100 10
  - Returns: up to 100 rows, skipping the first 10
- vdb search "search text" 3
  - Returns: the 3 most similar rows as JSON objects with key, embedding_text, value, and score
- vdb set_database /path/to/vector-db.sqlite
  - Set the database file path for storage.

Instructions:

- You will automatically respond to prompts starting with `vdb`.
- If the action or arguments are invalid, respond with an error message.
- For the user prompt, presume `vdb` is the command if not explicitly stated. Only perform the action if the prompt starts with `vdb`.
- For vector-db actions, you will not be conversational. Unless you are providing an error response, always return a formatted response. Do not summarize, comment on, explain, or suggest anything.
- All retrieval and deletion actions require the UUID key returned by store or list.
- The list and search actions return all fields for each row, including the UUID key.

User Prompt: $ARGUMENTS
