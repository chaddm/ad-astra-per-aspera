# tool/markdown_spec.md

## Tool: `markdown`

### Description

The `markdown` tool provides utilities for converting HTML content to Markdown using the [turndown](https://github.com/mixmark-io/turndown) library. Its primary function is to fetch a web page, convert its HTML to Markdown, and save the result to a file. This tool is designed for use with the Bun runtime.

---

## Tool Exports

This module exports multiple opencode tools. Each tool is available as `markdown_<exportname>`.

---

## Tool: `markdown_get_website`

### Description
Fetches the HTML content from a given URL, converts it to Markdown using Turndown, and returns the Markdown as a string.

### Arguments
| Name     | Type   | Description                                  | Required |
|----------|--------|----------------------------------------------|----------|
| url      | string | The URL of the web page to fetch and convert | Yes      |

### Returns
- `Promise<string>`: Markdown string of the web page.
- Throws an error if fetching or conversion fails.

### Example Usage
```typescript
import { get_website } from './tool/markdown.ts';
const md = await get_website.execute({ url: 'https://en.wikipedia.org/wiki/Markdown' });
console.log(md); // Markdown string of the page
```

---

## Tool: `markdown_website_to_file`

### Description
Fetches the HTML content from a given URL, converts it to Markdown using Turndown, and writes the Markdown output to the specified file.

### Arguments
| Name     | Type   | Description                                      | Required |
|----------|--------|--------------------------------------------------|----------|
| url      | string | The URL of the web page to fetch and convert     | Yes      |
| filename | string | The output file path for the Markdown result     | Yes      |

### Returns
- `Promise<string>`: Confirmation message when the file has been written successfully.
- Throws an error if fetching, conversion, or writing fails.

### Example Usage
```typescript
import { website_to_file } from './tool/markdown.ts';
await website_to_file.execute({
  url: 'https://en.wikipedia.org/wiki/Markdown',
  filename: './output/markdown.md'
});
// The file './output/markdown.md' will contain the Markdown version of the page.
```

---

## Tool: `markdown_get_webpage`

### Description
Fetches the HTML content from a given URL, converts it to Markdown using Turndown, and returns the Markdown as a string (alias for `get_website`).

### Arguments
| Name     | Type   | Description                                  | Required |
|----------|--------|----------------------------------------------|----------|
| url      | string | The URL of the web page to fetch and convert | Yes      |

### Returns
- `Promise<string>`: Markdown string of the web page.
- Throws an error if fetching or conversion fails.

### Example Usage
```typescript
import { get_webpage } from './tool/markdown.ts';
const md = await get_webpage.execute({ url: 'https://en.wikipedia.org/wiki/Markdown' });
console.log(md); // Markdown string of the page
```

---


### Description

Fetches the HTML content from a given URL, converts it to Markdown using Turndown, and writes the Markdown output to the specified file.

### Parameters

| Name     | Type   | Description                                      | Required |
|----------|--------|--------------------------------------------------|----------|
| url      | string | The URL of the web page to fetch and convert     | Yes      |
| filename | string | The output file path for the Markdown result     | Yes      |

### Return Value

- Returns: `Promise<void>`
- Resolves when the file has been written successfully.
- Throws an error if fetching, conversion, or writing fails.

### Error Handling

- If the URL cannot be fetched (network error, 404, etc.), the function throws an error with a descriptive message.
- If the HTML cannot be converted, throws an error.
- If the file cannot be written, throws an error.

### Dependencies

- [turndown](https://www.npmjs.com/package/turndown) (installed via `bun add turndown`)
- Bun runtime (for fetch and file writing)

### Example Usage

```typescript
import { website_to_file } from './tool/markdown.ts';

await website_to_file(
  'https://en.wikipedia.org/wiki/Markdown',
  './output/markdown.md'
);
// The file './output/markdown.md' will contain the Markdown version of the page.
```

### Notes

- The function uses sensible Turndown defaults:
  - Removes `<script>`, `<style>`, `<nav>`, `<footer>` tags.
  - Keeps `<pre>`, `<code>` tags.
  - Uses ATX heading style and fenced code blocks.
- All code blocks in the output must be appropriately typed (e.g., ```js, ```html, ```xml, etc.) based on the source content.
- No HTML tags should appear in the Markdown output unless they are inside a code block of type `html` or `xml`.
- The function can be extended in the future to accept Turndown options or plugins.
- Output file will be overwritten if it already exists.


---

## Test Coverage

- Should convert a simple HTML page to Markdown and write to file.
- Should handle network errors gracefully.
- Should handle file write errors gracefully.
- Should produce valid Markdown output for common HTML structures.
