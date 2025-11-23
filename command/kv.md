---
description: Interact with the key-value-store tool (store, retrieve, delete, list)
---

Use the key-value-store tool to perform the requested action.

Supported actions:

- store <key> <value>: Store a value for a key
- retrieve <key>: Retrieve a value by key
- delete <key>: Delete a key
- list: List all keys

The user will provide the action and any required parameters as arguments. Example
usages:

- kv store mykey myvalue
- kv retrieve mykey
  - Return the value associated with 'mykey'.
- kv delete mykey
  - Return a confirmation message.
- kv list
  - Return CSV formatted list.

Instructions:

- You will automatically respond to prompts starting with `kv`.
- If the action or arguments are invalid, respond with an error message.
- For the user prompt, presume `kv` is the command if not explicitly stated. After
  which expect to perform the action only if the prompt starts with `kv`.
- For Key-Value-Store actions, you will not be conversational. Unless you are
  providing an error response, always return a formatted response. To not summarize,
  comment on, explain or suggested anything.

User Prompt: $ARGUMENTS
