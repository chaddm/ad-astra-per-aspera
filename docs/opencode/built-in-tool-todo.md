# Built-in Tool: TODO

The TODO tool in OpenCode is designed to help you manage a structured task list for
your current coding session. It is especially useful for tracking multi-step,
complex, or non-trivial tasks. Here are the main functions and features available:

---

## 1. Read the TODO List

- **Function:** `todoread`
- **Purpose:** Retrieve and display the current list of tasks, including their status
  (pending, in_progress, completed, cancelled), priority, and descriptions.

---

## 2. Write/Update the TODO List

- **Function:** `todowrite`
- **Purpose:** Add, update, or remove tasks in the TODO list. You can:
  - Add new tasks with a description, unique ID, priority, and status.
  - Update the status of existing tasks (e.g., mark as in_progress, completed, or
    cancelled).
  - Edit the content or priority of tasks.
  - Remove tasks by omitting them from the updated list.

---

## 3. Task States

- **Supported Statuses:**
  - `pending`: Task not yet started.
  - `in_progress`: Task currently being worked on (ideally only one at a time).
  - `completed`: Task finished successfully.
  - `cancelled`: Task no longer needed.

---

## 4. Task Properties

Each task in the TODO tool has the following properties:

- `content`: Brief description of the task.
- `id`: Unique identifier for the task.
- `priority`: Priority level (`high`, `medium`, `low`).
- `status`: Current status (`pending`, `in_progress`, `completed`, `cancelled`).

---

## 5. Best Practices and Workflow

- Only one task should be `in_progress` at a time.
- Mark tasks as `completed` immediately after finishing.
- Cancel tasks that become irrelevant.
- Break complex tasks into smaller, manageable steps.
- Use clear, descriptive task names.

---

## Summary Table

| Function    | Purpose                                                |
| ----------- | ------------------------------------------------------ |
| `todoread`  | Read the current TODO list                             |
| `todowrite` | Write/update the TODO list (add, update, remove tasks) |

---

For more information, see the main `builtin-tools.md` or ask for usage examples!
