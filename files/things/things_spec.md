# Things App Tool Specification

## Overview

The Things App tool provides programmatic access to the
[Things](https://culturedcode.com/things/) task manager on macOS via its
x-callback-url scheme. It enables automation of to-do, project, and area management,
as well as search and version queries, by constructing and opening properly encoded
URLs. This tool is designed for use in the OpenCode ecosystem and is only functional
on macOS with the Things app installed and URL scheme enabled.

## Purpose

To allow users and automations to add, update, show, and search for tasks, projects,
and areas in Things, as well as retrieve the app version, using a consistent,
scriptable interface.

## Requirements

### Functional Requirements

1. **Add To-Do (`add`)**: Must create a new to-do in Things with support for all
   documented parameters (title, notes, when, deadline, tags, checklist, project,
   area, etc.).
2. **Add Project (`add_project`)**: Must create a new project in Things with support
   for all documented parameters (title, notes, area, tags, etc.).
3. **Update To-Do (`update`)**: Must update an existing to-do by ID, supporting all
   documented update parameters (id, title, notes, when, deadline, tags, checklist,
   project, area, etc.).
4. **Show Item (`show`)**: Must open Things and display a to-do, project, area, or
   built-in list by ID or query.
5. **Search (`search`)**: Must open the Things search screen, optionally with a query
   string.
6. **Version (`version`)**: Must open Things and return the app and URL scheme
   version.
7. **x-callback-url**: All commands must support the x-callback-url convention,
   including `x-success`, `x-error`, and `x-cancel` callbacks.
8. **URL Encoding**: All parameters must be percent-encoded according to RFC 3986.
   Newlines in multi-item fields must be encoded as `%0a`.
9. **Error Handling**: If the URL cannot be opened or the command fails, a clear
   error message must be returned.
10. **macOS Dependency**: The tool must only attempt to execute on macOS with Things
    installed and URL scheme enabled.

### Non-Functional Requirements

1. **Language Independence**: The specification must be implementable in any language
   that can open URLs on macOS.
2. **Security**: The tool must not expose or log sensitive data (such as auth tokens)
   except as required for Things API operation.
3. **Readability**: Output and error messages must be clear and suitable for both
   human and machine consumption.
4. **Extensibility**: The tool should be designed to allow future support for
   additional Things URL scheme commands.

## Command Specifications

### 1. Add To-Do (`add`)

- **URL Format**: `things:///add?param1=value1&param2=value2...`
- **Supported Parameters**:
  - `title` (string, required unless `titles` is used)
  - `titles` (string, newline-separated, for multiple to-dos)
  - `notes` (string)
  - `when` (string: `today`, `tomorrow`, `evening`, `anytime`, `someday`, date
    string, or date time string)
  - `deadline` (date string)
  - `tags` (comma-separated string)
  - `checklist-items` (newline-separated string)
  - `use-clipboard` (string: `replace-title`, `replace-notes`,
    `replace-checklist-items`)
  - `list-id` (string)
  - `list` (string)
  - `heading-id` (string)
  - `heading` (string)
  - `completed` (boolean)
  - `canceled` (boolean)
  - `show-quick-entry` (boolean)
  - `reveal` (boolean)
  - `creation-date` (ISO8601 date time string)
  - `completion-date` (ISO8601 date time string)
  - `x-success`, `x-error`, `x-cancel` (callback URLs)
- **Example**:
  ```
  things:///add?title=Buy%20milk&notes=Low%20fat.&when=tomorrow&tags=Errand
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///add?..." }
  ```

### 2. Add Project (`add_project`)

- **URL Format**: `things:///add-project?param1=value1&param2=value2...`
- **Supported Parameters**:
  - `title` (string, required)
  - `notes` (string)
  - `when` (string)
  - `deadline` (date string)
  - `tags` (comma-separated string)
  - `area-id` (string)
  - `area` (string)
  - `to-dos` (newline-separated string)
  - `completed` (boolean)
  - `canceled` (boolean)
  - `reveal` (boolean)
  - `creation-date` (ISO8601 date time string)
  - `completion-date` (ISO8601 date time string)
  - `x-success`, `x-error`, `x-cancel` (callback URLs)
- **Example**:
  ```
  things:///add-project?title=Plan%20Birthday%20Party&area=Family
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///add-project?..." }
  ```

### 3. Update To-Do (`update`)

- **URL Format**: `things:///update?param1=value1&param2=value2...`
- **Supported Parameters**:
  - `id` (string, required)
  - `auth-token` (string, required for modifying data)
  - `title` (string)
  - `notes` (string)
  - `prepend-notes` (string)
  - `append-notes` (string)
  - `when` (string)
  - `deadline` (date string)
  - `tags` (comma-separated string)
  - `add-tags` (comma-separated string)
  - `checklist-items` (newline-separated string)
  - `prepend-checklist-items` (newline-separated string)
  - `append-checklist-items` (newline-separated string)
  - `list-id` (string)
  - `list` (string)
  - `heading-id` (string)
  - `heading` (string)
  - `completed` (boolean)
  - `canceled` (boolean)
  - `reveal` (boolean)
  - `duplicate` (boolean)
  - `creation-date` (ISO8601 date time string)
  - `completion-date` (ISO8601 date time string)
  - `x-success`, `x-error`, `x-cancel` (callback URLs)
- **Example**:
  ```
  things:///update?id=4BE64FEA-8FEF-4F4F-B8B2-4E74605D5FA5&title=Buy%20bread
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///update?..." }
  ```

### 4. Show Item (`show`)

- **URL Format**: `things:///show?param1=value1&param2=value2...`
- **Supported Parameters**:
  - `id` (string, required unless `query` is used)
  - `query` (string, required unless `id` is used)
  - `filter` (comma-separated string)
  - `x-success`, `x-error`, `x-cancel` (callback URLs)
- **Example**:
  ```
  things:///show?id=today
  things:///show?query=vacation&filter=errand
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///show?..." }
  ```

### 5. Search (`search`)

- **URL Format**: `things:///search?param1=value1...`
- **Supported Parameters**:
  - `query` (string, optional)
  - `x-success`, `x-error`, `x-cancel` (callback URLs)
- **Example**:
  ```
  things:///search?query=vacation
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///search?..." }
  ```

### 6. Version (`version`)

- **URL Format**: `things:///version`
- **Supported Parameters**: None
- **Example**:
  ```
  things:///version
  ```
- **Example Output**:
  ```json
  { "success": true, "message": "Opened Things URL: things:///version" }
  ```

## x-callback-url and URL Encoding

- All commands must support the [x-callback-url](http://x-callback-url.com/)
  convention. If provided, `x-success`, `x-error`, and `x-cancel` must be included as
  query parameters and percent-encoded.
- All parameter values must be percent-encoded according to RFC 3986. Newlines in
  multi-item fields (e.g., checklist, titles) must be encoded as `%0a`.
- If a parameter is omitted or empty, it must not be included in the URL (except for
  clearing values, which requires an explicit empty value, e.g., `deadline=`).

## Acceptance Criteria

- [ ] Each command opens the correct Things URL and triggers the expected behavior in
      the Things app.
- [ ] All supported parameters are correctly encoded and passed.
- [ ] The tool returns a clear success or error message for each invocation.
- [ ] The tool only attempts to run on macOS with Things installed and URL scheme
      enabled.
- [ ] Error messages are clear and actionable.
- [ ] x-callback-url parameters are supported and handled.
- [ ] Out-of-scope commands are not implemented.

## Error Handling

- If the URL cannot be opened (e.g., Things not installed, URL scheme not enabled),
  return `{ "success": false, "message": "Failed to open Things URL: ..." }`.
- If required parameters are missing, return a clear error message indicating which
  parameter is missing.
- If Things returns an error via x-callback-url, surface the error message if
  possible.
- Do not expose sensitive data in error messages.

## macOS Dependency Requirements

- The tool must only execute on macOS.
- The Things app must be installed and the URL scheme enabled (see [Things Settings >
  General > Enable Things URLs]).
- The tool must use the `open` command or equivalent to launch URLs.

## Out of Scope

- Support for iOS or Windows platforms.
- Direct reading or modification of the Things database.
- Use of deprecated commands (e.g., `add-json`).
- JSON-based bulk import/export (use the `json` command directly if needed).
- Any operation not documented in the official Things URL scheme documentation.
