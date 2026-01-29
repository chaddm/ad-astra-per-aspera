# Things3 CLI Guide

This guide provides comprehensive documentation for the Things3 CLI tool (`things`),
which allows you to manage your Things 3 tasks, projects, and areas from the command
line.

## Table of Contents

- [Introduction](#introduction)
- [Global Options](#global-options)
- [Database Access](#database-access)
- [Authorization](#authorization)
- [Common Parameters](#common-parameters)
- [Commands](#commands)
- [Date Formats](#date-formats)
- [Query Syntax](#query-syntax)
- [Examples](#examples)

## Introduction

The Things3 CLI (`things`) is a command-line interface for Things 3 by Cultured Code.
It provides powerful automation capabilities for task management, project
organization, and workflow integration.

**Author**: Ossian Hempel **License**: MIT License **Issues**:
https://github.com/ossianhempel/things3-cli/issues **Things URL Scheme
Documentation**: https://culturedcode.com/things/support/articles/2803573/

## Global Options

These options work with all commands:

| Option            | Description                                            |
| ----------------- | ------------------------------------------------------ |
| `-V`, `--version` | Print version information about things3-cli and Things |
| `--debug`         | Enable debug mode for things3-cli                      |
| `--foreground`    | Open Things in the foreground                          |
| `--dry-run`       | Print the Things URL without opening it                |

## Database Access

The Things3 CLI reads from the local Things database for query commands. The database
lives in the Things app sandbox.

**Important**: You may need to grant your terminal **Full Disk Access** in macOS
System Settings to read the database.

**Database Location**:

- Default: Things handles this automatically
- Custom: Use `--db=PATH` option or set `THINGSDB` environment variable

```bash
export THINGSDB=/path/to/Things.sqlite3
```

## Authorization

Commands that modify Things data require authorization via the Things URL scheme.

**Setup Authorization Token**:

1. Open Things 3
2. Go to Settings → General → Things URLs
3. Copy the token (or enable "Allow 'things' CLI to access Things")
4. Set the environment variable:

```bash
export THINGS_AUTH_TOKEN=your-token-here
```

**Commands Requiring Authorization**:

- `add`
- `update`
- `update-project`
- `undo`

Alternatively, pass `--auth-token=TOKEN` to individual commands.

## Common Parameters

### List Query Parameters

The following parameters are available for list and query commands (`inbox`, `today`,
`upcoming`, `anytime`, `someday`, `repeating`, `deadlines`, `logbook`, `logtoday`,
`createdtoday`, `completed`, `canceled`, `trash`, `tasks`, `search`):

| Parameter                | Description                                                    |
| ------------------------ | -------------------------------------------------------------- |
| `--db=PATH`              | Path to the Things database (overrides THINGSDB variable)      |
| `--status=STATUS`        | Filter by status: `incomplete`, `completed`, `canceled`, `any` |
| `--project=PROJECT`      | Filter by project title or ID                                  |
| `--area=AREA`            | Filter by area title or ID                                     |
| `--tag=TAG`              | Filter by tag title or ID                                      |
| `--search=TEXT`          | Case-insensitive substring match on title or notes             |
| `--query=QUERY`          | Rich query with boolean ops, fields, and regex                 |
| `--limit=N`              | Limit number of results (0 = no limit). Default: 200           |
| `--offset=N`             | Offset results for pagination                                  |
| `--created-after=DATE`   | Filter tasks created after date (YYYY-MM-DD or RFC3339)        |
| `--created-before=DATE`  | Filter tasks created before date                               |
| `--modified-after=DATE`  | Filter tasks modified after date                               |
| `--modified-before=DATE` | Filter tasks modified before date                              |
| `--due-before=DATE`      | Filter tasks due before date (YYYY-MM-DD)                      |
| `--start-before=DATE`    | Filter tasks starting before date                              |
| `--has-url`              | Filter tasks with URLs in notes                                |
| `--sort=FIELDS`          | Sort by fields (e.g., `created,-deadline,title`)               |
| `--recursive`            | Include checklist items in JSON output                         |
| `--include-trashed`      | Include trashed tasks                                          |
| `--all`                  | Include completed, canceled, and trashed tasks                 |
| `--format=FORMAT`        | Output format: `table`, `json`, `jsonl`, `csv`                 |
| `--select=FIELDS`        | Select specific fields (comma-separated)                       |
| `--json`                 | Output JSON (alias for `--format json`)                        |
| `--no-header`            | Suppress the header row                                        |

### Scheduling Parameters

Used by `add`, `add-project`, `update`, `update-project`:

| Parameter               | Description                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------- |
| `--when=DATE\|DATETIME` | When to schedule: `today`, `tomorrow`, `evening`, `anytime`, `someday`, date string, or datetime string |
| `--deadline=DATE`       | Deadline date for the todo/project                                                                      |

### Repeating Template Parameters

Used by `add`, `add-project`, `update`, `update-project`:

| Parameter                | Description                                                      |
| ------------------------ | ---------------------------------------------------------------- |
| `--repeat=UNIT`          | Create repeating template. Units: `day`, `week`, `month`, `year` |
| `--repeat-mode=MODE`     | Repeat mode: `after-completion` (default) or `schedule`          |
| `--repeat-every=N`       | Repeat every N units. Default: 1                                 |
| `--repeat-start=DATE`    | Anchor date for repeat rule (YYYY-MM-DD). Defaults to today      |
| `--repeat-until=DATE`    | Stop repeating after given date (YYYY-MM-DD)                     |
| `--repeat-deadline=DAYS` | Add repeating deadlines; each copy appears in Today DAYS earlier |
| `--repeat-clear`         | Remove the repeating schedule (update commands only)             |

### Tag Parameters

Used by `add`, `add-area`, `add-project`, `update`, `update-area`, `update-project`:

| Parameter                    | Description                                                    |
| ---------------------------- | -------------------------------------------------------------- |
| `--tags=TAG1[,TAG2,TAG3...]` | Comma-separated tag titles. Replaces all current tags          |
| `--add-tags=TAG1[,TAG2...]`  | Add tags without removing existing ones (update commands only) |

### Notes Parameters

Used by `add`, `add-project`, `update`, `update-project`:

| Parameter               | Description                                      |
| ----------------------- | ------------------------------------------------ |
| `--notes=NOTES`         | The notes text (max 10,000 characters unencoded) |
| `--prepend-notes=NOTES` | Add text before existing notes (update only)     |
| `--append-notes=NOTES`  | Add text after existing notes (update only)      |

### Checklist Parameters

Used by `add`, `update`:

| Parameter                       | Description                                  |
| ------------------------------- | -------------------------------------------- |
| `--checklist-item=ITEM`         | Checklist item (can specify multiple times)  |
| `--prepend-checklist-item=ITEM` | Add item to front of checklist (update only) |
| `--append-checklist-item=ITEM`  | Add item to end of checklist (update only)   |

---

## Commands

### Creating Items

#### `add` - Add New Todo

Add new todos to Things.

**Usage**: `things add [OPTIONS...] [--] [-|TITLE]`

**Options**:

- `--db=PATH` - Path to database
- `--canceled`, `--cancelled` - Set todo to canceled. Default: false
- `--notes=NOTES` - Notes text (max 10,000 chars)
- `--show-quick-entry` - Show quick entry dialog. Default: false
- `--checklist-item=ITEM` - Add checklist item (can specify multiple times)
- `--completed` - Set todo to complete. Default: false
- `--completion-date=DATE` - ISO8601 datetime for completion date
- `--creation-date=DATE` - ISO8601 datetime for creation date
- `--deadline=DATE` - Deadline date
- `--heading=HEADING` - Title of heading within project to add to
- `--list=LIST` - Title of project or area to add to
- `--list-id=ID` - ID of project or area to add to
- `--reveal` - Navigate to and show the new todo. Default: false
- `--tags=TAG1[,TAG2...]` - Comma-separated tag titles
- `--when=DATE|DATETIME` - Schedule: `today`, `tomorrow`, `evening`, `anytime`,
  `someday`, date, or datetime
- `--repeat=UNIT` - Repeating template: `day`, `week`, `month`, `year`
- `--repeat-mode=MODE` - `after-completion` (default) or `schedule`
- `--repeat-every=N` - Repeat every N units. Default: 1
- `--repeat-start=DATE` - Anchor date (YYYY-MM-DD)
- `--repeat-until=DATE` - End date (YYYY-MM-DD)
- `--repeat-deadline=DAYS` - Repeating deadline days before
- `--titles=TITLE1[,TITLE2...]` - Create multiple todos
- `--use-clipboard=VALUE` - `replace-title`, `replace-notes`, or
  `replace-checklist-items`
- `--allow-unsafe-title` - Allow titles that look like flag assignments

**Examples**:

```bash
things add "Finish add to Things script"
things add --deadline=2020-08-01 "Ship this script"
things add "Weekly review" --repeat=week --when=today --tags=routine
```

#### `add-area` - Add New Area

Add a new area using AppleScript.

**Usage**: `things add-area [OPTIONS...] [-|TITLE]`

**Options**:

- `--tags=TAG1[,TAG2...]` - Comma-separated tag titles
- `--allow-unsafe-title` - Allow titles that look like flag assignments

**Examples**:

```bash
things add-area "Health"
things add-area --tags=Personal,Health "Fitness"
```

#### `add-project` - Add New Project

Add a new project to Things.

**Usage**: `things add-project [OPTIONS...] [-|TITLE]`

**Options**:

- `--area-id=AREAID` - ID of area to add to
- `--area=AREA` - Title of area to add to
- `--canceled`, `--cancelled` - Set project to canceled
- `--completed` - Set project to complete
- `--completion-date=DATE` - ISO8601 completion datetime
- `--deadline=DATE` - Deadline date
- `--notes=NOTES` - Notes text
- `--reveal` - Navigate into the new project
- `--tags=TAG1[,TAG2...]` - Comma-separated tag titles
- `--when=DATE|DATETIME` - Schedule date/time
- `--repeat=UNIT` - Repeating template unit
- `--repeat-mode=MODE` - Repeat mode
- `--repeat-every=N` - Repeat interval
- `--repeat-start=DATE` - Repeat anchor date
- `--repeat-until=DATE` - Repeat end date
- `--repeat-deadline=DAYS` - Repeating deadline days
- `--todo=TITLE` - Add todo to project (can specify multiple times)
- `--allow-unsafe-title` - Allow unsafe titles

**Examples**:

```bash
things add-project "Take over the world"
things add-project --area=Work --deadline=2026-03-01 "Q1 Planning"
```

### Updating Items

#### `update` - Update Existing Todos

Update existing todos using the Things URL scheme.

**Usage**: `things update [OPTIONS...] [--] [-|TITLE]`

**Required**: `--id=ID` or `--auth-token=TOKEN`

**Options**:

- `--db=PATH` - Database path
- `--auth-token=TOKEN` - Auth token (or use THINGS_AUTH_TOKEN)
- `--id=ID` - ID of todo to update
- `--yes` - Confirm bulk update
- `--allow-unsafe-title` - Allow unsafe titles
- `--notes=NOTES` - Replace notes
- `--prepend-notes=NOTES` - Add before existing notes
- `--append-notes=NOTES` - Add after existing notes
- `--when=DATE|DATETIME` - Set when field
- `--later` - Move to This Evening
- `--allow-non-today` - Allow moving non-today tasks to evening
- `--no-verify` - Skip verification of when updates
- `--deadline=DATE` - Set deadline
- `--tags=TAG1[,TAG2...]` - Replace tags
- `--add-tags=TAG1[,TAG2...]` - Add tags
- `--completed` - Complete or set incomplete
- `--canceled`, `--cancelled` - Cancel or set incomplete
- `--reveal` - Show updated todo
- `--duplicate` - Duplicate before updating
- `--completion-date=DATE` - Set completion date
- `--creation-date=DATE` - Set creation date
- `--heading=HEADING` - Move to heading
- `--list=LIST` - Move to project/area by title
- `--list-id=LISTID` - Move to project/area by ID
- `--checklist-item=ITEM` - Set checklist items
- `--prepend-checklist-item=ITEM` - Add to front
- `--append-checklist-item=ITEM` - Add to end
- `--repeat=UNIT` - Set repeating schedule
- `--repeat-mode=MODE` - Repeat mode
- `--repeat-every=N` - Repeat interval
- `--repeat-start=DATE` - Repeat start date
- `--repeat-until=DATE` - Repeat end date
- `--repeat-deadline=DAYS` - Repeating deadline
- `--repeat-clear` - Remove repeating schedule

**Examples**:

```bash
things update --id=8TN1bbz946oBsRBGiQ2XBN "Updated Title"
things update --id=8TN1bbz946oBsRBGiQ2XBN --deadline=2020-08-01 "Ship this script"
```

#### `update-area` - Update Existing Area

Update area using AppleScript.

**Usage**: `things update-area [OPTIONS...] [--] [-|TITLE]`

**Options**:

- `--id=ID` - Area ID (optional if title provided)
- `--title=TITLE` - New title
- `--tags=TAG1[,TAG2...]` - Replace all tags
- `--add-tags=TAG1[,TAG2...]` - Add tags

**Examples**:

```bash
things update-area --id=ABC123 --tags=Home,Chores
things update-area --add-tags=Focus "Work"
things update-area --id=ABC123 --title="New Name"
```

#### `update-project` - Update Existing Project

Update project using Things URL scheme.

**Usage**: `things update-project [OPTIONS...] [--] [-|TITLE]`

**Required**: `--id=ID` and `--auth-token=TOKEN` (or THINGS_AUTH_TOKEN)

**Options**:

- `--auth-token=TOKEN` - Auth token
- `--id=ID` - Project ID (required)
- `--allow-unsafe-title` - Allow unsafe titles
- `--notes=NOTES` - Replace notes
- `--prepend-notes=NOTES` - Add before notes
- `--append-notes=NOTES` - Add after notes
- `--when=DATE|DATETIME` - Schedule date
- `--deadline=DATE` - Deadline
- `--tags=TAG1[,TAG2...]` - Replace tags
- `--add-tags=TAG1[,TAG2...]` - Add tags
- `--area=AREA` - Move to area by title
- `--area-id=AREAID` - Move to area by ID
- `--completed` - Complete/set incomplete
- `--canceled`, `--cancelled` - Cancel/set incomplete
- `--reveal` - Show updated project
- `--duplicate` - Duplicate before updating
- `--completion-date=DATE` - Set completion date
- `--creation-date=DATE` - Set creation date
- `--todo=TITLE` - Add todo (can specify multiple times)

**Examples**:

```bash
things update-project --id=8TN1bbz946oBsRBGiQ2XBN "New Title"
things update-project --id=8TN1bbz946oBsRBGiQ2XBN --reveal "Ship this project"
```

### Deleting Items

#### `delete` - Delete Todo

Delete todos using AppleScript.

**Usage**: `things delete [OPTIONS...] [--] [-|TITLE]`

**Options**:

- `--db=PATH` - Database path
- `--id=ID` - Todo ID
- `--confirm=VALUE` - Confirm deletion (ID or title)
- `--yes` - Confirm bulk delete

**Examples**:

```bash
things delete --id=ABC123
things delete "Pay bills"
```

#### `delete-area` - Delete Area

Delete area using AppleScript.

**Usage**: `things delete-area [OPTIONS...] [--] [-|TITLE]`

**Options**:

- `--id=ID` - Area ID (optional if title provided)
- `--confirm=VALUE` - Confirm deletion (required in non-interactive mode)

**Examples**:

```bash
things delete-area --id=ABC123
things delete-area "Work"
```

#### `delete-project` - Delete Project

Delete project using AppleScript.

**Usage**: `things delete-project [OPTIONS...] [--] [-|TITLE]`

**Options**:

- `--id=ID` - Project ID (optional if title provided)
- `--confirm=VALUE` - Confirm deletion (required in non-interactive mode)

**Examples**:

```bash
things delete-project --id=ABC123
things delete-project "Launch"
```

### Querying Items

#### `show` - Show Single Item

Look up a single item (area, project, tag, or todo) in the database.

**Usage**: `things show [OPTIONS...] [--] [-|QUERY]`

**Options**:

- `--db=PATH` - Database path
- `--id=ID` - Item ID (takes precedence over QUERY)
- `--json` - Output JSON
- `--no-header` - Suppress header row

**Note**: Query must match exactly (case-insensitive) and return single result. Use
`search` for partial matching.

**Examples**:

```bash
things show --id=1234567890AB
things show "Project One"
echo "Home" | things show -
```

#### `search` - Search Tasks

Search tasks in the database.

**Usage**: `things search [OPTIONS...] [--] <-|QUERY>`.

**Options**: Uses [List Query Parameters](#list-query-parameters)

**Examples**:

```bash
things search "Work"
things search --tag=urgent --status=incomplete "report"
echo "Home" | things search -
```

### List Views

These commands list tasks from specific views and all support
[List Query Parameters](#list-query-parameters).

#### `inbox` - List Inbox Tasks

Lists unfiled tasks in the Inbox.

**Usage**: `things inbox [OPTIONS...]`

#### `today` - List Today Tasks

Lists tasks that should appear in Today (including predicted items).

**Usage**: `things today [OPTIONS...]`

#### `upcoming` - List Upcoming Tasks

Lists tasks scheduled in the future (excludes tasks with only deadlines).

**Usage**: `things upcoming [OPTIONS...]`

#### `anytime` - List Anytime Tasks

Lists tasks in the Anytime list.

**Usage**: `things anytime [OPTIONS...]`

#### `someday` - List Someday Tasks

Lists tasks in the Someday list.

**Usage**: `things someday [OPTIONS...]`

#### `repeating` - List Repeating Tasks

Lists repeating tasks.

**Usage**: `things repeating [OPTIONS...]`

#### `deadlines` - List Tasks with Deadlines

Lists tasks that have deadlines.

**Usage**: `things deadlines [OPTIONS...]`

### Logbook Views

These commands list completed/canceled tasks and all support
[List Query Parameters](#list-query-parameters).

#### `logbook` - List Logbook

Lists completed and canceled tasks.

**Usage**: `things logbook [OPTIONS...]`

**Default status**: `any`

#### `logtoday` - List Completed Today

Lists tasks completed or canceled today.

**Usage**: `things logtoday [OPTIONS...]`

#### `createdtoday` - List Created Today

Lists tasks created today.

**Usage**: `things createdtoday [OPTIONS...]`

#### `completed` - List Completed Tasks

Lists completed tasks only.

**Usage**: `things completed [OPTIONS...]`

**Default status**: `completed`

#### `canceled` - List Canceled Tasks

Lists canceled tasks only.

**Usage**: `things canceled [OPTIONS...]`

**Default status**: `canceled`

#### `trash` - List Trashed Tasks

Lists trashed tasks.

**Usage**: `things trash [OPTIONS...]`

### Collections

#### `all` - List All Sections

Lists Inbox, Today, Upcoming, Repeating, Anytime, Someday, Logbook, No Area, and
Areas sections.

**Usage**: `things all [OPTIONS...]`

**Options**:

- `--db=PATH` - Database path
- `--limit=N` - Limit results
- `--recursive` - Include checklist items
- `--json` - Output JSON
- `--no-header` - Suppress header

#### `projects` - List Projects

Lists projects from the database.

**Usage**: `things projects [OPTIONS...]`

**Options**:

- `--db=PATH` - Database path
- `--status=STATUS` - Filter by status (default: `incomplete`)
- `--area=AREA` - Filter by area
- `--include-trashed` - Include trashed projects
- `--all` - Include completed, canceled, and trashed
- `--json` - Output JSON
- `--no-header` - Suppress header
- `--recursive` - Include nested headings/todos
- `--only-projects` - Only projects (implies --recursive)

#### `areas` - List Areas

Lists areas from the database.

**Usage**: `things areas [OPTIONS...]`

**Options**:

- `--db=PATH` - Database path
- `--json` - Output JSON
- `--no-header` - Suppress header
- `--recursive` - Include nested projects/headings/todos
- `--only-projects` - Only areas and projects (implies --recursive)

#### `tags` - List Tags

Lists tags from the database.

**Usage**: `things tags [OPTIONS...]`

**Options**:

- `--db=PATH` - Database path
- `--json` - Output JSON
- `--no-header` - Suppress header

#### `tasks` - List Todos

Lists todos from the database.

**Usage**: `things tasks [OPTIONS...]`

**Options**: Uses [List Query Parameters](#list-query-parameters)

**Default status**: `incomplete`

### Utilities

#### `undo` - Undo Last Bulk Action

Replays the last bulk update or trash action.

**Usage**: `things undo [OPTIONS...]`

**Options**:

- `--auth-token=TOKEN` - Auth token (or use THINGS_AUTH_TOKEN)
- `--yes` - Confirm undo for multiple tasks

**Note**: Undoing updates requires auth token. Undoing trash recreates tasks as new
items.

#### `auth` - Show Auth Token Status

Shows whether `THINGS_AUTH_TOKEN` is set and provides setup help.

**Usage**: `things auth`

#### `help` - Show Documentation

Shows documentation for a given command.

**Usage**: `things help <COMMAND>`

**Example**:

```bash
things help add
things help search
```

---

## Date Formats

The Things3 CLI accepts various date formats:

- **Simple**: `today`, `tomorrow`, `evening`, `anytime`, `someday`
- **ISO 8601**: `YYYY-MM-DD` (e.g., `2026-01-28`)
- **RFC 3339**: `YYYY-MM-DDTHH:MM:SS±HH:MM` (e.g., `2026-01-28T14:30:00-05:00`)
- **With time**: Date strings can include time for reminders (ignored for `someday`)

## Query Syntax

Rich query syntax (`--query=QUERY`) supports:

- **Boolean operators**: `AND`, `OR`, `NOT`
- **Field filters**: `title:text`, `tag:work`, `area:home`
- **Regex**: `title:/regex/`, `notes:/pattern/`
- **Combinations**: `title:/urgent/ AND tag:work`

**Example**:

```bash
things search --query="tag:work AND status:incomplete"
```

## Examples

### Adding Tasks

```bash
# Simple task
things add "Buy groceries"

# Task with deadline and tags
things add "Submit report" --deadline=2026-02-01 --tags=work,urgent

# Recurring weekly task
things add "Team meeting" --when=today --repeat=week --tags=meetings

# Task in specific project
things add "Design mockups" --list="Website Redesign" --tags=design
```

### Updating Tasks

```bash
# Update task title
things update --id=ABC123 "Updated title"

# Mark task complete
things update --id=ABC123 --completed

# Add tags to existing task
things update --id=ABC123 --add-tags=priority,review

# Move task to today
things update --id=ABC123 --when=today
```

### Querying Tasks

```bash
# List today's tasks
things today

# List incomplete work tasks
things search --tag=work --status=incomplete

# List overdue tasks (due before today)
things deadlines --due-before=$(date +%Y-%m-%d)

# Show specific task details
things show --id=ABC123

# Export today's tasks to JSON
things today --json > today.json
```

### Managing Projects

```bash
# Create project
things add-project "Website Redesign" --area=Work --deadline=2026-03-31

# Create project with todos
things add-project "Launch Campaign" --todo="Design assets" --todo="Write copy"

# Update project deadline
things update-project --id=XYZ789 --deadline=2026-04-15

# List active projects
things projects --status=incomplete
```

### Managing Areas

```bash
# Create area
things add-area "Health" --tags=personal

# List areas
things areas

# Update area tags
things update-area --id=DEF456 --add-tags=focus
```

### Advanced Queries

```bash
# Tasks created this week
things search --created-after=$(date -v-7d +%Y-%m-%d)

# Incomplete tasks with URLs
things tasks --has-url --status=incomplete

# Sort tasks by deadline
things tasks --sort=deadline,-created

# Complex query with regex
things search --query="title:/report/ AND tag:work"

# Export completed tasks to CSV
things completed --format=csv --limit=100 > completed.csv
```

### Bulk Operations

```bash
# Create multiple tasks at once
things add --titles="Task 1,Task 2,Task 3" --tags=batch

# Update task from stdin
echo "New title" | things update --id=ABC123 -
```

---

## Tips and Best Practices

1. **Use environment variables**: Set `THINGS_AUTH_TOKEN` and `THINGSDB` for
   convenience
2. **Leverage JSON output**: Use `--json` for integration with other tools
3. **Combine filters**: Stack multiple filter options for precise queries
4. **Use dry-run**: Test commands with `--dry-run` before execution
5. **Check auth status**: Run `things auth` to verify token setup
6. **Grant Full Disk Access**: Required for database read operations

---

## Troubleshooting

**Database access denied**:

- Grant Full Disk Access to your terminal in System Settings

**Authorization failed**:

- Verify `THINGS_AUTH_TOKEN` is set correctly
- Run `things auth` to check token status

**No results returned**:

- Check filter parameters
- Verify database path with `--db` option
- Use `--all` to include completed/canceled tasks

**Command not found**:

- Ensure things3-cli is installed and in your PATH
- Check installation with `things --version`

---

## Resources

- **GitHub Repository**: https://github.com/ossianhempel/things3-cli
- **Things URL Scheme Docs**:
  https://culturedcode.com/things/support/articles/2803573/
- **Things 3 Support**: https://culturedcode.com/things/support/

---

_This guide covers Things3 CLI version 1.x. For the latest updates, visit the GitHub
repository._
