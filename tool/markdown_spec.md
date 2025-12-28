# Tool - Markdown Specifications

## Tool: `markdown`

### Description

The `markdown` tool provides utilities for converting HTML content to Markdown using
the [turndown](https://github.com/mixmark-io/turndown) library. Its primary function
is to fetch a web page, convert its HTML to Markdown, and save the result to a file.
This tool is designed for use with the Bun runtime.

---

## Tool Exports

This module exports multiple opencode tools. Each tool is available as
`markdown_<exportname>`.

---

## Tool: `markdown_get_website`

### Description

Fetches the HTML content from a given URL, converts it to Markdown using Turndown,
and returns the Markdown as a string.

### Arguments

| Name | Type   | Description                                  | Required |
| ---- | ------ | -------------------------------------------- | -------- |
| url  | string | The URL of the web page to fetch and convert | Yes      |

### Returns

- `Promise<string>`: Markdown string of the web page.
- Throws an error if fetching or conversion fails.

### Example Usage

```typescript
import { get_website } from "./tool/markdown.ts";
const md = await get_website.execute({
  url: "https://en.wikipedia.org/wiki/Markdown",
});
console.log(md); // Markdown string of the page
```

---

## Tool: `markdown_website_to_file`

### Description

Fetches the HTML content from a given URL, converts it to Markdown using Turndown,
and writes the Markdown output to the specified file.

### Arguments

| Name     | Type   | Description                                  | Required |
| -------- | ------ | -------------------------------------------- | -------- |
| url      | string | The URL of the web page to fetch and convert | Yes      |
| filename | string | The output file path for the Markdown result | Yes      |

### Returns

- `Promise<string>`: Confirmation message when the file has been written
  successfully.
- Throws an error if fetching, conversion, or writing fails.

### Example Usage

```typescript
import { website_to_file } from "./tool/markdown.ts";
await website_to_file.execute({
  url: "https://en.wikipedia.org/wiki/Markdown",
  filename: "./output/markdown.md",
});
// The file './output/markdown.md' will contain the Markdown version of the page.
```

---

## Tool: `markdown_get_webpage`

### Description

Fetches the HTML content from a given URL, converts it to Markdown using Turndown,
and returns the Markdown as a string (alias for `get_website`).

### Arguments

| Name | Type   | Description                                  | Required |
| ---- | ------ | -------------------------------------------- | -------- |
| url  | string | The URL of the web page to fetch and convert | Yes      |

### Returns

- `Promise<string>`: Markdown string of the web page.
- Throws an error if fetching or conversion fails.

### Example Usage

```typescript
import { get_webpage } from "./tool/markdown.ts";
const md = await get_webpage.execute({
  url: "https://en.wikipedia.org/wiki/Markdown",
});
console.log(md); // Markdown string of the page
```

---

## Tool: `markdown_table_from_csv`

### Description

Converts CSV string content into a properly formatted Markdown table with aligned columns. Text columns are left-aligned, numeric columns are right-aligned and aligned to the decimal point, and numbers with different formats in the same column are normalized to the highest complexity.

### Arguments

| Name | Type   | Description                      | Required |
| ---- | ------ | -------------------------------- | -------- |
| csv  | string | CSV content string to convert    | Yes      |

### Returns

- `Promise<string>`: Markdown-formatted table string.
- Returns empty string if input is empty.
- Throws an error if CSV parsing fails.

### Example Usage

```typescript
import { table_from_csv } from "./tool/markdown.ts";
const csv = `Name,Age,Salary
Alice,30,75000.50
Bob,25,60000
Charlie,35,85123.456`;

const table = await table_from_csv.execute({ csv });
console.log(table);
// Output:
// | Name    |  Age |    Salary |
// |---------|------|-----------|
// | Alice   |   30 | 75000.500 |
// | Bob     |   25 | 60000.000 |
// | Charlie |   35 | 85123.456 |
```

### Notes

- Uses a proper CSV parsing library to handle quoted fields and escaped characters
- First row is always treated as the header row
- Column widths are calculated to fit the largest element in each column
- Empty cells are rendered as empty in the table
- Rows with fewer columns than the header have empty trailing columns
- Rows with more columns than the header have extra columns ignored
- Numbers in the same column are normalized to the same decimal precision
- Complies with GitHub Flavored Markdown table syntax

---

## Test Coverage

- Should convert a simple HTML page to Markdown and write to file.
- Should handle network errors gracefully.
- Should handle file write errors gracefully.
- Should produce valid Markdown output for common HTML structures.
