# Research Report: NPM Libraries for Converting Webpages to Markdown (Bun Compatible)

## Summary

This report identifies the top NPM libraries that can convert a webpage (given a URL)
to a properly formatted markdown document. The focus is on libraries that are
popular, actively maintained (updated within the last year), and compatible with the
Bun runtime. Each library is evaluated for API usability, documentation, and
maintenance status.

---

## Top 3 Recommendations

### 1. **Turndown** (with fetch)

- **NPM**: https://www.npmjs.com/package/turndown
- **GitHub**: https://github.com/mixmark-io/turndown
- **Last update**: 2024
- **Weekly downloads**: ~500K+
- **Bun compatibility**: Yes (pure JS, no Node.js-specific dependencies)
- **Usage**: Fetch the HTML with `fetch`, then convert to markdown:
  ```js
  import TurndownService from "turndown";
  const turndownService = new TurndownService();
  const response = await fetch("https://example.com");
  const html = await response.text();
  const markdown = turndownService.turndown(html);
  ```
- **Notes**: Highly configurable, supports plugins, and is widely used.

---

### 2. **@extractus/article-extractor** (for clean content, combine with Turndown)

- **NPM**: https://www.npmjs.com/package/@extractus/article-extractor
- **GitHub**: https://github.com/extractus/article-extractor
- **Last update**: 2024
- **Weekly downloads**: ~50K+
- **Bun compatibility**: Yes (modern ESM, no Node.js-only dependencies)
- **Usage**: Extracts main article content as HTML, which you can then convert to
  markdown with Turndown.
  ```js
  import { extract } from "@extractus/article-extractor";
  const article = await extract("https://example.com");
  // article.content is HTML, pass to Turndown for markdown
  ```
- **Notes**: Great for extracting just the main content from news/blogs.

---

### 3. **html-to-md**

- **NPM**: https://www.npmjs.com/package/html-to-md
- **GitHub**: https://github.com/stonehank/html-to-md
- **Last update**: 2024
- **Weekly downloads**: ~15K+
- **Bun compatibility**: Yes (pure JS)
- **Usage**: Can convert HTML string or directly fetch and convert a URL.
  ```js
  import htmlToMd from "html-to-md";
  const markdown = await htmlToMd("https://example.com");
  ```
- **Notes**: Simple, direct, and lightweight.

---

## Recommendation

For best results and flexibility, use Turndown with Bun's fetch API. For extracting
just the main article content, combine @extractus/article-extractor with Turndown.
All three libraries are actively maintained and compatible with Bun.

---

## Citations

- [Turndown NPM Package](https://www.npmjs.com/package/turndown)
- [Turndown GitHub Repository](https://github.com/mixmark-io/turndown)
- [@extractus/article-extractor NPM](https://www.npmjs.com/package/@extractus/article-extractor)
- [@extractus/article-extractor GitHub](https://github.com/extractus/article-extractor)
- [html-to-md NPM Package](https://www.npmjs.com/package/html-to-md)
- [html-to-md GitHub Repository](https://github.com/stonehank/html-to-md)
- [Bun Runtime Documentation](https://bun.sh/docs)
