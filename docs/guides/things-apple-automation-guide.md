# Specification: Full AppleScript Control of Things 3 for JavaScript Integration

## 1. Purpose

This document specifies how an automated agent (AI) should implement **full
read/write control of Things 3** via **AppleScript**, exposed through a **JavaScript
(Node.js) module** on macOS.

The goal is to enable:

- Enumeration of Areas, Projects, and Tasks
- Reading all relevant task attributes
- Reading and assigning tags
- Creating, updating, completing, and deleting items
- Reliable, structured data exchange between AppleScript and JavaScript

This specification assumes **macOS**, **Things 3**, and **Node.js**.

---

## 2. Architecture Overview

```
JavaScript (Node.js)
   │
   │  osascript (STDOUT/STDERR)
   ▼
AppleScript
   │
   │  Scripting Bridge
   ▼
Things3.app
```

### Key Constraints

- AppleScript is the authoritative control surface
- JavaScript never manipulates Things directly
- All data returned from AppleScript MUST be serialized (JSON or delimited text)

---

## 3. Execution Model

### 3.1 Invocation

JavaScript MUST invoke AppleScript via:

```sh
osascript -e "<script>"
```

or by executing `.scpt` files.

### 3.2 Output Rules

- AppleScript MUST return **machine-parseable output**
- Preferred format: **JSON**
- AppleScript lists MUST be explicitly converted to strings

---

## 4. Things 3 Object Model (AppleScript)

### 4.1 Top-Level Objects

```applescript
tell application "Things3"
    lists
    areas
    projects
    tags
end tell
```

### 4.2 Core Classes

| Class   | Description                  |
| ------- | ---------------------------- |
| area    | Logical grouping of projects |
| project | Collection of to-dos         |
| to do   | Individual task              |
| tag     | Label assignable to to-dos   |

---

## 5. Areas

### 5.1 List Areas

```applescript
tell application "Things3"
    get areas
end tell
```

### 5.2 Area Attributes

| Attribute | Type   |
| --------- | ------ |
| id        | string |
| name      | string |

### 5.3 Serialize Areas

AppleScript MUST output:

```json
[{ "id": "...", "name": "..." }]
```

---

## 6. Projects

### 6.1 List All Projects

```applescript
tell application "Things3"
    get projects
end tell
```

### 6.2 Projects by Area

```applescript
tell application "Things3"
    tell area "Work"
        get projects
    end tell
end tell
```

### 6.3 Project Attributes

| Attribute | Type                  |           |
| --------- | --------------------- | --------- |
| id        | string                |           |
| name      | string                |           |
| area      | area or missing value |           |
| status    | open                  | completed |

---

## 7. Tasks (To-Dos)

### 7.1 Tasks in a Project

```applescript
tell application "Things3"
    tell project "My Project"
        get to dos
    end tell
end tell
```

### 7.2 Tasks in an Area (Flattened)

```applescript
tell application "Things3"
    tell area "Work"
        get to dos of projects
    end tell
end tell
```

### 7.3 Global Task Queries

| Scope    | AppleScript                 |
| -------- | --------------------------- |
| Inbox    | `to dos of list "Inbox"`    |
| Today    | `to dos of list "Today"`    |
| Anytime  | `to dos of list "Anytime"`  |
| Someday  | `to dos of list "Someday"`  |
| Upcoming | `to dos of list "Upcoming"` |

---

## 8. Task Attributes (Read)

Each to-do MAY expose the following:

| Attribute         | Type               |           |
| ----------------- | ------------------ | --------- |
| id                | string             |           |
| name              | string             |           |
| notes             | string             |           |
| status            | open               | completed |
| creation date     | date               |           |
| modification date | date               |           |
| due date          | date or missing    |           |
| start date        | date or missing    |           |
| completion date   | date or missing    |           |
| tags              | list of tag        |           |
| project           | project or missing |           |
| area              | area or missing    |           |

Example:

```applescript
get {id, name, notes, due date, tags} of someTodo
```

---

## 9. Tags

### 9.1 List All Tags

```applescript
tell application "Things3"
    get tags
end tell
```

### 9.2 Tag Attributes

| Attribute | Type   |
| --------- | ------ |
| id        | string |
| name      | string |

### 9.3 Tasks by Tag

```applescript
tell application "Things3"
    get to dos of tag "Urgent"
end tell
```

---

## 10. Writing Operations

### 10.1 Create Task

```applescript
tell application "Things3"
    make new to do with properties {name:"Title", notes:"Body"}
end tell
```

### 10.2 Assign Project or Area

```applescript
set project of newTodo to project "My Project"
```

### 10.3 Assign Tags

```applescript
set tags of newTodo to {tag "Work", tag "Urgent"}
```

### 10.4 Complete Task

```applescript
set status of someTodo to completed
```

### 10.5 Delete Task

```applescript
delete someTodo
```

---

## 11. Serialization Rules

### 11.1 JSON Output Pattern

AppleScript MUST:

1. Iterate objects
2. Extract scalar properties
3. Manually assemble JSON strings

Example:

```applescript
return "[{\"id\":\"" & id of t & "\",\"name\":\"" & name of t & "\"}]"
```

### 11.2 Dates

Dates MUST be returned as:

- ISO-8601 strings
- Or UNIX timestamps

---

## 12. Error Handling

### 12.1 AppleScript Errors

- Use `try / on error`
- Return structured error JSON

```json
{ "error": true, "message": "..." }
```

### 12.2 JavaScript Responsibility

- Treat non-JSON output as failure
- Surface raw AppleScript stderr

---

## 13. Security & Permissions

- macOS Automation permission required:
  - Terminal / Node → Things3

- First execution will prompt user

---

## 14. Non-Goals

- Cross-platform support
- Real-time sync guarantees
- Background execution without user session

---

## 15. Implementation Guidance for AI

An AI implementing this module MUST:

- Generate AppleScript dynamically
- Avoid UI scripting
- Prefer object references over names when possible
- Cache IDs where available
- Validate JSON before returning to caller

---

## 16. References

- Things 3 AppleScript Dictionary
- macOS Automation (TCC) documentation
