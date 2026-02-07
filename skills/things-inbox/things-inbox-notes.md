# Things Inbox - Technical Notes

## Command Overview

The `things inbox` command lists unfiled tasks in the Things3 Inbox.

**Basic Usage:**

```bash
things inbox | toon
```

**Full Usage:** `things inbox [OPTIONS...] | toon`

---

## Available Options

The `inbox` command supports all **List Query Parameters**. Here are the key options:

### Database & Output Format

| Parameter         | Description                                               |
| ----------------- | --------------------------------------------------------- |
| `--db=PATH`       | Path to the Things database (overrides THINGSDB variable) |
| `--json`          | Output JSON (required for piping to toon)                 |
| `--no-header`     | Suppress the header row (table format only)               |
| `--select=FIELDS` | Select specific fields (comma-separated)                  |

### Filtering

| Parameter           | Description                                                    |
| ------------------- | -------------------------------------------------------------- |
| `--status=STATUS`   | Filter by status: `incomplete`, `completed`, `canceled`, `any` |
| `--project=PROJECT` | Filter by project title or ID                                  |
| `--area=AREA`       | Filter by area title or ID                                     |
| `--tag=TAG`         | Filter by tag title or ID                                      |
| `--search=TEXT`     | Case-insensitive substring match on title or notes             |
| `--query=QUERY`     | Rich query with boolean ops, fields, and regex                 |
| `--has-url`         | Filter tasks with URLs in notes                                |

### Date Filtering

| Parameter                | Description                                             |
| ------------------------ | ------------------------------------------------------- |
| `--created-after=DATE`   | Filter tasks created after date (YYYY-MM-DD or RFC3339) |
| `--created-before=DATE`  | Filter tasks created before date                        |
| `--modified-after=DATE`  | Filter tasks modified after date                        |
| `--modified-before=DATE` | Filter tasks modified before date                       |
| `--due-before=DATE`      | Filter tasks due before date (YYYY-MM-DD)               |
| `--start-before=DATE`    | Filter tasks starting before date                       |

### Pagination & Sorting

| Parameter       | Description                                          |
| --------------- | ---------------------------------------------------- |
| `--limit=N`     | Limit number of results (0 = no limit). Default: 200 |
| `--offset=N`    | Offset results for pagination                        |
| `--sort=FIELDS` | Sort by fields (e.g., `created,-deadline,title`)     |

### Additional Options

| Parameter           | Description                                    |
| ------------------- | ---------------------------------------------- |
| `--recursive`       | Include checklist items in JSON output         |
| `--include-trashed` | Include trashed tasks                          |
| `--all`             | Include completed, canceled, and trashed tasks |

---

## Output Format - TOON

When piping `things inbox --json` through `toon`, the command returns data in **TOON
(Token-Oriented Object Notation)** format - a compact, human-readable, schema-aware
format optimized for LLM token efficiency.

### Example Single Todo in TOON Format

```
[1]{type,uuid,title,status,trashed,notes,start,created,modified,index,today_index}:
  to-do,Fh2P6qsWESVpZ5RHsJCK5L,"Transcription ",0,false,"https://youtube.com/watch?v=EZ4EjJ0iDDQ&si=SjXAjTfxaL-eXxnK",Inbox,"2026-02-03 17:58:09","2026-02-04 00:53:25",-5589,0
```

### TOON Format Structure

TOON uses a tabular format that:

- Declares array length: `[N]` (e.g., `[1]` for one item, `[3]` for three items)
- Lists field names once in header: `{field1,field2,field3}`
- Presents data in CSV-like rows with values comma-separated
- Handles strings with quotes when they contain special characters
- Is ~40% more token-efficient than JSON for uniform arrays

### Multi-Item TOON Format Example

```
[3]{type,uuid,title,status,trashed,notes,start,created,modified}:
  to-do,ABC123,"Buy groceries",incomplete,false,"Milk, eggs, bread",Inbox,"2026-02-03 10:00:00","2026-02-03 10:00:00"
  to-do,DEF456,"Review PR",incomplete,false,"https://github.com/example/pr/123",Today,"2026-02-02 14:30:00","2026-02-04 09:15:00"
  to-do,GHI789,"Call dentist",incomplete,false,,Inbox,"2026-02-01 16:45:00","2026-02-01 16:45:00"
```

### Common Fields in Todo Objects

Based on Things3 data structure, each todo row typically includes:

- `type` - Item type (usually `to-do`)
- `uuid` - Unique identifier
- `title` - Todo title
- `status` - Status value (0=incomplete, other values for completed/canceled)
- `trashed` - Boolean (true/false)
- `notes` - Notes text (optional, empty if none)
- `start` - When/start date or list name (e.g., "Inbox", "Today", "Anytime")
- `created` - Creation timestamp
- `modified` - Last modification timestamp
- `index` - Sort index
- `today_index` - Position in Today view
- `due` - Deadline date (optional)
- `tags` - Tag array (when present)
- `checklistItems` - Nested checklist (when `--recursive` is used)

**Note:** The exact fields returned depend on the data and options used. TOON format
adapts to include only the fields that have data.

---

## Example Commands

### Basic Inbox Listing

```bash
# Get all inbox items as TOON
things inbox --json | toon

# Get inbox items as table (without toon)
things inbox
```

### Filtered Queries

```bash
# Only incomplete items
things inbox --json --status=incomplete | toon

# Items with specific tag
things inbox --json --tag=urgent | toon

# Search by text
things inbox --json --search="report" | toon

# Items with URLs
things inbox --json --has-url | toon
```

### With Checklist Items

```bash
# Include checklist items
things inbox --json --recursive | toon
```

### Pagination

```bash
# First 50 items
things inbox --json --limit=50 | toon

# Next 50 items
things inbox --json --limit=50 --offset=50 | toon
```

### Date Filtering

```bash
# Items created in last 7 days
things inbox --json --created-after=$(date -v-7d +%Y-%m-%d) | toon

# Items due before today
things inbox --json --due-before=$(date +%Y-%m-%d) | toon
```

### Sorting

```bash
# Sort by creation date (oldest first)
things inbox --json --sort=created | toon

# Sort by deadline descending, then title
things inbox --json --sort=-deadline,title | toon
```

---

## Best Practices for Skill Implementation

1. **Always pipe through toon:** Use `things inbox --json | toon` for token-efficient
   output
2. **Set reasonable limits:** Use `--limit=200` (default) or make it configurable
3. **Allow filtering:** Support common filters like `--status`, `--tag`, `--search`
4. **Include recursive data:** Use `--recursive` to get checklist items when needed
5. **Handle pagination:** Support `--offset` and `--limit` for large datasets
6. **Error handling:** Check for database access issues and empty results
7. **Return TOON format:** Parse TOON output for maximum token efficiency
8. **Preserve structure:** TOON format is self-documenting with explicit schemas

---

## Common Use Cases

### Get all inbox tasks

```bash
things inbox --json | toon
```

### Get incomplete tasks only

```bash
things inbox --json --status=incomplete | toon
```

### Get urgent tasks

```bash
things inbox --json --tag=urgent --status=incomplete | toon
```

### Get recent inbox items

```bash
things inbox --json --created-after=$(date -v-3d +%Y-%m-%d) | toon
```

### Get inbox with full details

```bash
things inbox --json --recursive --all | toon
```

---

## Why TOON Format?

TOON (Token-Oriented Object Notation) provides:

- **~40% fewer tokens** than JSON for uniform arrays
- **Schema-aware structure** with explicit field declarations
- **Human-readable** tabular format similar to CSV
- **LLM-friendly** with clear structure and field headers
- **Lossless** round-trip conversion with JSON
- **Self-documenting** with array lengths and field names in header

For Things3 inbox data, which typically consists of uniform todo objects, TOON format
provides significant token savings while maintaining readability and structure.
