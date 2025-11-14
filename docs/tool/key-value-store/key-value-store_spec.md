# Key-Value Store Tool Specification

## Overview
The Key-Value Store tool provides a simple interface for storing and retrieving string values associated with unique string keys. It is designed to be used as a plugin/tool in the OpenCode ecosystem, but the requirements are language-agnostic and can be implemented in any environment.

## Purpose
To allow users to persistently store, retrieve, and delete string values using unique
string keys, with a straightforward and human-friendly interface.

## Requirements

Build tool `key-value-store` as a `opencode` tool with the following functions:

### Functional Requirements


1. **store**: The tool must allow storing a string value under a unique string key.
2. **retrieve**: The tool must allow retrieving the string value associated with a given key.
3. **delete**: The tool must allow deleting a key-value pair by key.
4. **list**: The tool must provide a way to list all currently stored keys.

### Non-Functional Requirements
1. **Use Bun**: Use Bun and Bun's built-in SQLite support for implementation.
2. **Persistence with SQLite**: The tool must use SQLite for persistent storage. If no database exists on any call, the tool will create and initialize the database automatically.
   - The database must contain a table named `objects` with two columns:
     - `key` (type: text, unique, not null)
     - `value` (type: text)
   - The table must have an index on the `key` column.

## Acceptance Criteria

### Store Command
- [ ] The tool can store a string value under a unique string key.
- [ ] If the key already exists, the value is updated.
- [ ] The tool returns a success message upon storing or updating a value.
- [ ] Errors (e.g., database issues) are reported clearly.
- [ ] The store command will automatically create the database and table if they do not exist.
- [ ] The database will be named `key-value-store` with a `.sqlite` extension.

### Retrieve Command
- [ ] The tool can retrieve the value for a given key.
- [ ] If the key does not exist, the command returns nothing (empty output).
- [ ] If the key is found, the output is in CSV format: `key,value`.

### Delete Command
- [ ] The tool can delete a key-value pair by key.
- [ ] If the key does not exist, the command returns nothing (empty output).
- [ ] If the key is found and deleted, the output is the key.

### List Command
- [ ] The tool can list stored keys with pagination.
- [ ] By default, the command returns no more than 50 keys per call.
- [ ] The output is a human-readable list of keys.
- [ ] If no keys exist, the output is an empty list or a suitable message.

### General Acceptance Criteria
- [ ] The tool uses only standard libraries and persists data between invocations using SQLite.
- [ ] The tool returns clear error messages for invalid operations.
- [ ] All outputs are human-readable.

## Example Usage

- Store:
  `store("username", "alice")`
  Output: `Key "username" stored successfully.`

- Retrieve:
  `retrieve("username")`
  Output: `alice`

- Delete:
  `delete("username")`
  Output: `Key "username" deleted.`

- List:
  `list()`
  Output: `["username", "email", "project"]`

## Out of Scope
- Storing non-string values.
- Advanced querying or filtering.
- User authentication or access control.
- Customization of storage backend.

## Tests

### Store Tests

- Given the database does not exist
  - When I store key `foo` with value `bar`
    - it creates the database
    - it creates the table

### Retrieve Tests

- Given the database does not exist
  - When I retrieve key `foo`
    - it creates the database
    - it creates the table
    - it returns nothing

- When I store key `foo` with value `bar`
  - it creates the database
  - it creates the table
  - When I retrieve key `foo`
    - it returns `foo,bar`
