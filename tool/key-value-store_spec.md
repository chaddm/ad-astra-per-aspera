# key-value-store Tool Specification

## set_database

**Description:** Sets the SQLite database file used by the key-value-store tool. This
affects all subsequent store, retrieve, delete, and list operations.

**Arguments:**

- `action`: Must be `set_database`.
- `filename` (optional):
  - If blank or omitted, defaults to `~/.config/opencode/key-value-store.sqlite`.
  - If a directory, uses that directory with the default filename
    `key-value-store.sqlite`.
  - If a directory and filename, uses the defined path and name as the database file.

**Returns:**

- A string confirming the database path that has been set.

**Examples:**

- Set to default:
  ```json
  { "action": "set_database" }
  ```
- Set to a custom directory:
  ```json
  { "action": "set_database", "filename": "/tmp/mydbdir/" }
  ```
- Set to a custom file:
  ```json
  { "action": "set_database", "filename": "/tmp/mydbdir/custom.sqlite" }
  ```

**Notes:**

- All subsequent key-value-store actions will use the selected database file until
  changed again.
