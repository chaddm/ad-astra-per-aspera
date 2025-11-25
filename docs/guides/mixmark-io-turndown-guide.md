# Mixmark IO Turndown User Guide

## Overview

Turndown is a JavaScript library that converts HTML to Markdown. It's a reliable,
flexible, and fast HTML-to-Markdown converter that works in both browser and Node.js
environments. Originally created by Dom Christie and now maintained by Mixmark IO,
Turndown provides a clean API for converting HTML documents or fragments into
well-formatted Markdown text.

## Table of Contents

1. [Installation](#installation)
2. [Basic Usage](#basic-usage)
3. [Configuration Options](#configuration-options)
4. [Advanced Features](#advanced-features)
5. [Plugin System](#plugin-system)
6. [Custom Rules](#custom-rules)
7. [Common Use Cases](#common-use-cases)
8. [Troubleshooting](#troubleshooting)
9. [Best Practices](#best-practices)
10. [API Reference](#api-reference)

## Installation

### Node.js

```bash
# npm
npm install turndown

# yarn
yarn add turndown

# pnpm
pnpm add turndown
```

### Browser

```html
<!-- Via CDN -->
<script src="https://unpkg.com/turndown/dist/turndown.js"></script>

<!-- ES6 Module -->
<script type="module">
  import TurndownService from 'https://unpkg.com/turndown/lib/turndown.es.js';
</script>
```

## Basic Usage

### Node.js

```javascript
const TurndownService = require('turndown');
const turndownService = new TurndownService();

const html = '<h1>Hello World</h1><p>This is a paragraph with <strong>bold text</strong>.</p>';
const markdown = turndownService.turndown(html);

console.log(markdown);
// Output:
// # Hello World
//
// This is a paragraph with **bold text**.
```

### Browser

```javascript
const turndownService = new TurndownService();
const markdown = turndownService.turndown('<h1>Hello World</h1>');
console.log(markdown); // # Hello World
```

### ES6 Modules

```javascript
import TurndownService from 'turndown';

const turndownService = new TurndownService();
const markdown = turndownService.turndown('<h1>Hello World</h1>');
```

## Configuration Options

Turndown provides several configuration options to customize the conversion process:

### Headings

```javascript
const turndownService = new TurndownService({
  headingStyle: 'setext' // 'setext' or 'atx' (default)
});

// ATX style (default)
// # Heading 1
// ## Heading 2

// Setext style
// Heading 1
// =========
// Heading 2
// ---------
```

### Horizontal Rules

```javascript
const turndownService = new TurndownService({
  hr: '***' // Default: '* * *'
});
```

### Bullet Lists

```javascript
const turndownService = new TurndownService({
  bulletListMarker: '-' // '-', '+', or '*' (default)
});
```

### Code Blocks

```javascript
const turndownService = new TurndownService({
  codeBlockStyle: 'fenced', // 'indented' or 'fenced' (default)
  fence: '```' // Default: '```'
});
```

### Link Style

```javascript
const turndownService = new TurndownService({
  linkStyle: 'referenced' // 'inlined' (default) or 'referenced'
});

// Inlined (default): [Link text](http://example.com)
// Referenced: [Link text][1]
//             [1]: http://example.com
```

### Link Reference Style

```javascript
const turndownService = new TurndownService({
  linkReferenceStyle: 'collapsed' // 'full' (default), 'collapsed', or 'shortcut'
});
```

### Emphasis

```javascript
const turndownService = new TurndownService({
  emDelimiter: '*', // '*' (default) or '_'
  strongDelimiter: '**' // '**' (default) or '__'
});
```

## Advanced Features

### Whitespace Handling

```javascript
const turndownService = new TurndownService({
  preformattedCode: false, // Preserve whitespace in code blocks
  blankReplacement: function (content, node) {
    return node.isBlock ? '\n\n' : '';
  }
});
```

### Keep Certain HTML Tags

```javascript
const turndownService = new TurndownService({
  keep: ['del', 'ins'] // Keep these HTML tags as-is
});

// Input: <p>This is <del>deleted</del> and <ins>inserted</ins> text.</p>
// Output: This is <del>deleted</del> and <ins>inserted</ins> text.
```

### Remove Specific Tags

```javascript
const turndownService = new TurndownService({
  remove: ['script', 'style'] // Remove these tags entirely
});
```

## Plugin System

Turndown supports plugins to extend its functionality. Here are some popular plugins:

### Official Plugins

#### turndown-plugin-gfm

Adds support for GitHub Flavored Markdown features:

```bash
npm install turndown-plugin-gfm
```

```javascript
const TurndownService = require('turndown');
const turndownPluginGfm = require('turndown-plugin-gfm');

const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm);

// Supports tables, strikethrough, and task lists
const html = `
  <table>
    <tr><th>Name</th><th>Age</th></tr>
    <tr><td>John</td><td>30</td></tr>
  </table>
`;

console.log(turndownService.turndown(html));
// | Name | Age |
// | --- | --- |
// | John | 30 |
```

#### Individual GFM Features

```javascript
// Use only specific GFM features
turndownService.use(turndownPluginGfm.tables);
turndownService.use(turndownPluginGfm.strikethrough);
turndownService.use(turndownPluginGfm.taskListItems);
```

### Creating Custom Plugins

```javascript
function myPlugin(turndownService) {
  turndownService.addRule('customRule', {
    filter: 'span',
    replacement: function (content, node) {
      return '**' + content + '**';
    }
  });
}

const turndownService = new TurndownService();
turndownService.use(myPlugin);
```

## Custom Rules

You can add custom rules to handle specific HTML elements:

### Basic Rule

```javascript
turndownService.addRule('strikethrough', {
  filter: ['del', 's'],
  replacement: function (content) {
    return '~~' + content + '~~';
  }
});
```

### Advanced Rule with Conditions

```javascript
turndownService.addRule('highlightedText', {
  filter: function (node) {
    return node.nodeName === 'SPAN' &&
           node.style.backgroundColor === 'yellow';
  },
  replacement: function (content) {
    return '==' + content + '==';
  }
});
```

### Rule with Context

```javascript
turndownService.addRule('codeWithLanguage', {
  filter: 'pre',
  replacement: function (content, node) {
    const language = node.getAttribute('data-language') || '';
    return '\n\n```' + language + '\n' +
           node.firstChild.textContent +
           '\n```\n\n';
  }
});
```

### Removing Rules

```javascript
turndownService.remove('strikethrough');
```

## Common Use Cases

### Converting Web Content

```javascript
// Fetch and convert web content
async function convertWebPage(url) {
  const response = await fetch(url);
  const html = await response.text();

  const turndownService = new TurndownService({
    remove: ['script', 'style', 'nav', 'footer'],
    keep: ['pre', 'code']
  });

  return turndownService.turndown(html);
}
```

### Email to Markdown

```javascript
const turndownService = new TurndownService({
  linkStyle: 'referenced',
  emDelimiter: '_',
  remove: ['style', 'script']
});

const emailMarkdown = turndownService.turndown(emailHtml);
```

### CMS Content Migration

```javascript
const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.gfm);

// Custom rule for CMS-specific elements
turndownService.addRule('cmsImage', {
  filter: function (node) {
    return node.nodeName === 'IMG' &&
           node.hasAttribute('data-cms-id');
  },
  replacement: function (content, node) {
    const id = node.getAttribute('data-cms-id');
    const alt = node.getAttribute('alt') || '';
    return `![${alt}](cms:${id})`;
  }
});
```

### Rich Text Editor Integration

```javascript
// Convert rich text editor output
function convertRichText(editorHtml) {
  const turndownService = new TurndownService({
    bulletListMarker: '-',
    codeBlockStyle: 'fenced'
  });

  // Handle editor-specific elements
  turndownService.addRule('editorQuote', {
    filter: ['blockquote'],
    replacement: function (content) {
      return '\n\n> ' + content.trim().replace(/\n/g, '\n> ') + '\n\n';
    }
  });

  return turndownService.turndown(editorHtml);
}
```

## Troubleshooting

### Common Issues

#### Excessive Whitespace

```javascript
// Problem: Too much whitespace in output
// Solution: Configure blank replacement
const turndownService = new TurndownService({
  blankReplacement: function (content, node) {
    return node.isBlock ? '\n\n' : '';
  }
});
```

#### Missing Line Breaks

```javascript
// Problem: Block elements not properly separated
// Solution: Add custom rules for specific elements
turndownService.addRule('divAsBlock', {
  filter: 'div',
  replacement: function (content) {
    return '\n\n' + content + '\n\n';
  }
});
```

#### Complex Table Handling

```javascript
// Problem: Complex tables not converting properly
// Solution: Use GFM plugin and simplify tables
const turndownService = new TurndownService();
turndownService.use(turndownPluginGfm.tables);

// Pre-process HTML to simplify complex tables
function simplifyTables(html) {
  return html.replace(/<table[^>]*>/gi, '<table>')
            .replace(/<(thead|tbody|tfoot)[^>]*>/gi, '')
            .replace(/<\/(thead|tbody|tfoot)>/gi, '');
}
```

#### Special Characters

```javascript
// Problem: Special characters not handled correctly
// Solution: Custom replacement function
turndownService.addRule('specialChars', {
  filter: function (node) {
    return node.nodeType === 3; // Text node
  },
  replacement: function (content) {
    return content.replace(/[\\`*_{}[\]()#+\-.!]/g, '\\$&');
  }
});
```

### Performance Optimization

#### Large Documents

```javascript
// For very large HTML documents
const turndownService = new TurndownService({
  // Minimize rules for better performance
  remove: ['script', 'style', 'meta', 'link'],
  // Use simpler options
  headingStyle: 'atx',
  codeBlockStyle: 'fenced'
});

// Process in chunks if needed
function convertLargeDocument(html) {
  const chunks = html.match(/[\s\S]{1,50000}/g) || [];
  return chunks.map(chunk => turndownService.turndown(chunk)).join('');
}
```

#### Memory Usage

```javascript
// Reuse service instance
const globalTurndownService = new TurndownService();

function convertMultiple(htmlArray) {
  return htmlArray.map(html => globalTurndownService.turndown(html));
}
```

### Browser Compatibility

#### IE Support

```javascript
// For older browsers, ensure polyfills are loaded
if (!String.prototype.trim) {
  String.prototype.trim = function () {
    return this.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
  };
}
```

## Best Practices

### 1. Configure for Your Use Case

```javascript
// Web content scraping
const webScrapingService = new TurndownService({
  remove: ['script', 'style', 'nav', 'aside', 'footer'],
  headingStyle: 'atx',
  bulletListMarker: '-'
});

// Documentation conversion
const docsService = new TurndownService({
  codeBlockStyle: 'fenced',
  linkStyle: 'inlined',
  emDelimiter: '*'
});
```

### 2. Handle Edge Cases

```javascript
// Always sanitize input
function safeConvert(html) {
  if (!html || typeof html !== 'string') {
    return '';
  }

  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error('Conversion error:', error);
    return html; // Fallback to original HTML
  }
}
```

### 3. Validate Output

```javascript
function convertWithValidation(html) {
  const markdown = turndownService.turndown(html);

  // Basic validation
  if (markdown.length === 0 && html.length > 0) {
    console.warn('Conversion resulted in empty output');
  }

  // Check for common issues
  if (markdown.includes('undefined') || markdown.includes('[object Object]')) {
    console.warn('Conversion may have failed');
  }

  return markdown;
}
```

### 4. Use Plugins Appropriately

```javascript
// Only load plugins you need
const turndownService = new TurndownService();

// For GitHub content
if (needsGithubFeatures) {
  turndownService.use(turndownPluginGfm.tables);
  turndownService.use(turndownPluginGfm.strikethrough);
}
```

## API Reference

### Constructor

#### `new TurndownService([options])`

Creates a new TurndownService instance.

**Parameters:**
- `options` (Object, optional): Configuration options

**Options:**
- `headingStyle`: `'atx'` or `'setext'`
- `hr`: String for horizontal rule
- `bulletListMarker`: `'-'`, `'+'`, or `'*'`
- `codeBlockStyle`: `'indented'` or `'fenced'`
- `fence`: String for code block fence
- `emDelimiter`: `'*'` or `'_'`
- `strongDelimiter`: `'**'` or `'__'`
- `linkStyle`: `'inlined'` or `'referenced'`
- `linkReferenceStyle`: `'full'`, `'collapsed'`, or `'shortcut'`
- `keep`: Array of tag names to preserve
- `remove`: Array of tag names to remove
- `blankReplacement`: Function for blank node replacement

### Methods

#### `turndown(html)`

Converts HTML to Markdown.

**Parameters:**
- `html` (String): HTML string to convert

**Returns:** String - Converted Markdown

#### `use(plugin)`

Applies a plugin to the service.

**Parameters:**
- `plugin` (Function): Plugin function

#### `addRule(key, rule)`

Adds a conversion rule.

**Parameters:**
- `key` (String): Rule identifier
- `rule` (Object): Rule definition
  - `filter`: String, Array, or Function to match elements
  - `replacement`: Function that returns replacement text

#### `remove(key)`

Removes a rule.

**Parameters:**
- `key` (String): Rule identifier to remove

#### `keep(filter)`

Preserves elements matching the filter.

**Parameters:**
- `filter`: String, Array, or Function to match elements

#### `escape(string)`

Escapes Markdown special characters.

**Parameters:**
- `string` (String): Text to escape

**Returns:** String - Escaped text

## Resources and References

### Official Resources
- [GitHub Repository](https://github.com/mixmark-io/turndown)
- [NPM Package](https://www.npmjs.com/package/turndown)
- [Official Plugins](https://github.com/mixmark-io/turndown-plugin-gfm)

### Community Resources
- Stack Overflow discussions
- Third-party tutorials and guides
- Integration examples with popular frameworks

### Related Tools
- Pandoc: Universal document converter
- markdown-it: Markdown parser
- remark: Markdown processor
- showdown: HTML to Markdown converter

---

*This guide covers the essential features and usage patterns of Turndown. For the latest updates and additional information, always refer to the official documentation and repository.*