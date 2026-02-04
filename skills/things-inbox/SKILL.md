---
name: things-inbox
description: Get todos from Things3 inbox.
license: MIT
compatibility: opencode
metadata:
  requires: things3-cli, toon-js
  platforms: macOS
---

## What I do

Run the Things3 CLI to retrieve inbox todos and return structured data in **TOON
(Token-Oriented Object Notation)** format - a compact, human-readable, schema-aware
format optimized for LLM token efficiency.

### Basic Command

```bash
things inbox --json | toon
```

### With Options

```bash
things inbox --json [OPTIONS] | toon
```

## Available Options

### Filtering Options

- `--status=STATUS` - Filter by status: `incomplete`, `completed`, `canceled`, `any`
- `--tag=TAG` - Filter by tag title or ID
- `--search=TEXT` - Case-insensitive substring match on title or notes
- `--query=QUERY` - Rich query with boolean ops, fields, and regex
- `--has-url` - Filter tasks with URLs in notes
- `--project=PROJECT` - Filter by project title or ID
- `--area=AREA` - Filter by area title or ID

### Date Filtering Options

- `--created-after=DATE` - Filter tasks created after date (YYYY-MM-DD or RFC3339)
- `--created-before=DATE` - Filter tasks created before date
- `--modified-after=DATE` - Filter tasks modified after date
- `--modified-before=DATE` - Filter tasks modified before date
- `--due-before=DATE` - Filter tasks due before date (YYYY-MM-DD)
- `--start-before=DATE` - Filter tasks starting before date

### Pagination & Sorting Options

- `--limit=N` - Limit number of results (0 = no limit). Default: 200
- `--offset=N` - Offset results for pagination
- `--sort=FIELDS` - Sort by fields (e.g., `created,-deadline,title`)

### Additional Options

- `--recursive` - Include checklist items in JSON output
- `--include-trashed` - Include trashed tasks
- `--all` - Include completed, canceled, and trashed tasks
- `--db=PATH` - Path to the Things database (overrides THINGSDB variable)

## When to use me

Use me when you need to:

- Retrieve all items from the Things3 Inbox in token-efficient TOON format
- Get inbox items with specific filters (status, tags, dates)
- Export inbox data in TOON format for LLM processing
- Search inbox items by text content
- Get inbox items with their checklist items
- Paginate through large inbox lists

## Common Examples

### Get all incomplete inbox items

```bash
things inbox --json --status=incomplete | toon
```

### Get inbox items with a specific tag

```bash
things inbox --json --tag=urgent | toon
```

### Get inbox items with checklist items

```bash
things inbox --json --recursive | toon
```

### Search inbox for specific text

```bash
things inbox --json --search="report" | toon
```

### Get recent inbox items (last 7 days)

```bash
things inbox --json --created-after=$(date -v-7d +%Y-%m-%d) | toon
```

### Get inbox items with pagination

```bash
# First 50 items
things inbox --json --limit=50 | toon

# Next 50 items
things inbox --json --limit=50 --offset=50 | toon
```

### Get inbox items sorted by deadline

```bash
things inbox --json --sort=-deadline,title | toon
```

### Get inbox items with URLs

```bash
things inbox --json --has-url | toon
```

## Output Format - TOON

Returns data in **TOON (Token-Oriented Object Notation)** format.

### Example Single Todo

```
[1]{type,uuid,title,status,trashed,notes,start,created,modified,index,today_index}:
  to-do,Fh2P6qsWESVpZ5RHsJCK5L,"Transcription ",0,false,"https://youtube.com/watch?v=EZ4EjJ0iDDQ&si=SjXAjTfxaL-eXxnK",Inbox,"2026-02-03 17:58:09","2026-02-04 00:53:25",-5589,0
```

### Example Multiple Todos

```
[3]{type,uuid,title,status,trashed,notes,start,created,modified}:
  to-do,ABC123,"Buy groceries",incomplete,false,"Milk, eggs, bread",Inbox,"2026-02-03 10:00:00","2026-02-03 10:00:00"
  to-do,DEF456,"Review PR",incomplete,false,"https://github.com/example/pr/123",Today,"2026-02-02 14:30:00","2026-02-04 09:15:00"
  to-do,GHI789,"Call dentist",incomplete,false,,Inbox,"2026-02-01 16:45:00","2026-02-01 16:45:00"
```

### TOON Format Benefits

- **~40% fewer tokens** than JSON for uniform arrays
- **Schema declaration** with explicit field names in header `{field1,field2,...}`
- **Array length** declared upfront `[N]`
- **CSV-like rows** for compact, readable data
- **Self-documenting** structure

### Common Fields

- `type` - Item type (usually `to-do`)
- `uuid` - Unique identifier
- `title` - Todo title
- `status` - Status value (0=incomplete, other for completed/canceled)
- `trashed` - Boolean (true/false)
- `notes` - Notes text (optional)
- `start` - When/start field (e.g., "Inbox", "Today", "Anytime", or date)
- `created` - Creation timestamp
- `modified` - Last modification timestamp
- `index` - Sort index
- `today_index` - Position in Today view
- `due` - Deadline date (optional)
- `tags` - Tags array (when present)
- `checklistItems` - Nested checklist (when `--recursive` is used)

## Requirements

- Things3 app must be installed on macOS
- `things` CLI tool must be installed (https://github.com/ossianhempel/things3-cli)
- `toon` CLI must be available (`npx @toon-format/cli` or installed globally)
- Terminal may require **Full Disk Access** in macOS System Settings to read the
  Things database

## Notes

For detailed technical information about the command, options, and TOON format
output, see `things-inbox-notes.md` in this skill directory.
