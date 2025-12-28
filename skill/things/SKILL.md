---
name: Things3
description: Interact with Things3 task management application to retrieve areas and projects with filtering capabilities.
license: MIT
compatibility: opencode
metadata:
---

## What I do

This skill provides scripts to interact with Things3 (task management application) and retrieve data in CSV format.

### Available Scripts

**Get Areas** - Retrieve areas from Things3 with optional filtering.

```bash
./skill/things/get-areas [ids=id1,id2] [name=searchterm] [tags=tag1,tag2]
```

**Get Projects** - Retrieve projects from Things3 with optional filtering.

```bash
./skill/things/get-projects [ids=id1,id2] [name=searchterm] [area_ids=aid1,aid2] [tags=tag1,tag2]
```

**Get Project** - Retrieve detailed information for a single project by ID, including all to-dos/items within the project.

```bash
./skill/things/get-project <project_id>
```

**Get To-do** - Retrieve detailed information for a single to-do by ID.

```bash
./skill/things/get-todo <todo_id>
```

**Set To-do** - Update a to-do's properties (name, status, notes, and/or tags).

```bash
./skill/things/set-todo <todo_id> [name=...] [status=...] [notes=...] [tag_names=...]
```

## When to use me

Use me when you need to work with the Things3 Tasks application (aka Things). This skill allows you to interact with Things3 to retrieve and filter your areas and projects.

## Filter Options

All filters are optional and can be combined. Multiple filters use **AND** logic (must match all), while values within a filter use **OR** logic (match any).

### get-areas Filters

- **`ids`** - Comma-delimited area IDs (whitespace trimmed)
  - Example: `ids=RnYsrXCAB2VZCvqkKBeVty` or `ids="id1, id2, id3"`
  
- **`name`** - Case-insensitive substring search in area name
  - Example: `name=work` or `name="Personal Projects"`
  
- **`tags`** - Comma-delimited tag names (whitespace trimmed, exact match)
  - Example: `tags="Work: Provider Nexus"` or `tags="tag1, tag2"`

### get-projects Filters

- **`ids`** - Comma-delimited project IDs (whitespace trimmed)
  - Example: `ids=2SwCCY2WDAKqksu6oufbwb` or `ids="id1, id2, id3"`
  
- **`name`** - Case-insensitive substring search in project name
  - Example: `name=camera` or `name="ops prime"`
  
- **`area_ids`** - Comma-delimited area IDs (whitespace trimmed)
  - Example: `area_ids=K9U3dAEXnchmJTTCQLput5` or `area_ids="aid1, aid2"`
  
- **`tags`** - Comma-delimited tag names (whitespace trimmed, exact match)
  - Example: `tags="Important"` or `tags="tag1, tag2"`

### set-todo Parameters

**Required:**
- **`<todo_id>`** - The to-do ID (first positional argument)

**Optional (at least one required):**
- **`name="new name"`** - Update the to-do name
- **`status=open|completed|cancelled`** - Update status (must be one of these three values)
- **`notes="note text"`** - Update notes
- **`tag_names="tag1; tag2; tag3"`** - Set tags (semicolon-separated, replaces all existing tags)

## Examples

### Get Areas

```bash
# Get all areas
./skill/things/get-areas

# Get specific area by ID
./skill/things/get-areas ids=RnYsrXCAB2VZCvqkKBeVty

# Get multiple areas by ID
./skill/things/get-areas ids="RnYsrXCAB2VZCvqkKKBeVty, K9U3dAEXnchmJTTCQLput5"

# Search areas by name
./skill/things/get-areas name=work

# Filter by tags
./skill/things/get-areas tags="Work: Provider Nexus"

# Combine filters (AND logic)
./skill/things/get-areas name=work tags="Work: Provider Nexus"
```

### Get Projects

```bash
# Get all projects (may be slow with many projects)
./skill/things/get-projects

# Get specific project by ID
./skill/things/get-projects ids=2SwCCY2WDAKqksu6oufbwb

# Search projects by name
./skill/things/get-projects name=camera

# Get projects in specific area
./skill/things/get-projects area_ids=K9U3dAEXnchmJTTCQLput5

# Get projects in multiple areas
./skill/things/get-projects area_ids="K9U3dAEXnchmJTTCQLput5, Eq2FmN4cc7fR3E8XE1zuhe"

# Combine filters (name AND area)
./skill/things/get-projects name=ops area_ids=Eq2FmN4cc7fR3E8XE1zuhe
```

### Get Project (Single)

```bash
# Get detailed information for a specific project including to-dos
./skill/things/get-project MQnDdHSoUqPbaxxU9s38LM

# Output format:
# - Project CSV header + project data row
# - Blank line separator
# - To-dos CSV header + all to-do data rows (one per to-do)

# Error handling - missing parameter
./skill/things/get-project
# Output: Error: Project ID is required

# Error handling - invalid ID
./skill/things/get-project INVALID_ID
# Output: execution error: Error: Project not found with ID: INVALID_ID
```

### Get To-do

```bash
# Get detailed information for a specific to-do
./skill/things/get-todo UZW6GzhQkXWGC95L8jBGrs

# Error handling - missing parameter
./skill/things/get-todo
# Output: Error: To-do ID is required

# Error handling - invalid ID
./skill/things/get-todo INVALID_ID
# Output: execution error: stopme (-2700)
```

### Set To-do

```bash
# Update to-do name
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs name="Updated Name"

# Update to-do status
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs status=completed

# Update notes
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs notes="This is a note"

# Update multiple fields at once
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs name="New Name" status=open

# Set tags (replaces all existing tags)
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs tag_names="Work; Important"

# Error handling - no fields to update
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs
# Output: Error: At least one field to update is required (name, status, notes, or tag_names)

# Error handling - invalid status
./skill/things/set-todo UZW6GzhQkXWGC95L8jBGrs status=invalid
# Output: Error: Invalid status 'invalid'. Must be: open, completed, or cancelled
```

## Output Format

All scripts return CSV format with headers.

### get-areas Output Columns

- `id` - Area unique identifier
- `name` - Area name
- `collapsed` - Whether area is collapsed (true/false)
- `tag_names` - Semicolon-separated tag names

### get-projects Output Columns

- `id` - Project unique identifier
- `name` - Project name
- `status` - Project status (open/completed)
- `area_id` - Area ID (if project belongs to an area)
- `area_name` - Area name (if project belongs to an area)
- `tag_names` - Semicolon-separated tag names
- `due_date` - Due date (if set)
- `creation_date` - When project was created
- `modification_date` - When project was last modified
- `completion_date` - When project was completed (if completed)

**Note:** Project notes are not included in the output.

### get-project Output Format

Returns two CSV sections separated by a blank line:

**Project Section (14 columns):**
All fields from get-projects plus:
- `notes` - Project notes (included in get-project, excluded from get-projects)
- `activation_date` - When project was activated
- `cancellation_date` - When project was cancelled (if cancelled)
- `contact` - Associated contact (if any)

**To-dos Section (9 columns):**
- `id` - To-do unique identifier
- `name` - To-do name/title
- `status` - To-do status (open/completed/cancelled)
- `notes` - To-do notes
- `tag_names` - Semicolon-separated tag names
- `due_date` - Due date (if set)
- `creation_date` - When to-do was created
- `modification_date` - When to-do was last modified
- `completion_date` - When to-do was completed (if completed)

### get-todo Output Columns

Same as the to-dos section in get-project output:

- `id` - To-do unique identifier
- `name` - To-do name/title
- `status` - To-do status (open/completed/cancelled)
- `notes` - To-do notes
- `tag_names` - Semicolon-separated tag names
- `due_date` - Due date (if set)
- `creation_date` - When to-do was created
- `modification_date` - When to-do was last modified
- `completion_date` - When to-do was completed (if completed)

### set-todo Output

After successful update, returns the same CSV format as get-todo (header + single row with the updated to-do).

## Notes

- All ID and tag filters require exact matches (after trimming whitespace)
- Name filters are case-insensitive and match substrings
- Multiple values in a single filter are OR'ed (match any)
- Multiple different filters are AND'ed (match all)
- Emoji in names are supported

