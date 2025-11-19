# Vector Database Tool Specification (Orama-based)

## Overview

The Vector Database tool provides fast semantic search and similarity matching over markdown files and other content using the [Orama](https://orama.dev/docs/introduction) vector database. It enables agents and commands to perform semantic lookups, making it easy to find relevant content based on meaning rather than keywords. All vector data is stored locally in the `.orama/` directory for disk persistence and privacy.

## Purpose

To allow users and agents to store, search, and manage vector embeddings and associated metadata using Orama as the backend, with local disk persistence and support for local or plugin-based embeddings.

## Requirements

Build tool `vector-db` as an `opencode` tool with the following functions:

### Functional Requirements

1. **reindex**: Crawl the `pages/` directory for markdown files, compute embeddings, and rebuild the Orama index.
2. **find**: Perform semantic search using text or vector queries, returning ranked results.
3. **clear**: Remove all indexed data from the Orama database.
4. **insert**: Add a new document with embedding to the database.
5. **delete**: Remove a document by ID.
6. **update**: Update a document's metadata or embedding.

### Non-Functional Requirements

1. **Use Orama**: Use Orama and its plugins for vector storage, embeddings, and disk persistence.
2. **Persistence**: Store all Orama database files in the `.orama/` directory. Use JSON or LevelDB plugins for disk persistence.
3. **Local Embeddings**: Support local embedding generation via plugins or integration with local models.
4. **No Cloud Required**: All operations are local-only; no cloud or external API required.

## API Design

### reindex()

Evicts current vector data and rebuilds the index by crawling the `pages/` directory for markdown files. Indexes the content for semantic search.

```typescript
import { create } from '@orama/orama'
import { pluginDataPersistence } from '@orama/plugin-data-persistence'
import { pipeline } from '@xenova/transformers'

const persistencePlugin = await pluginDataPersistence({
  path: './.orama/orama-index.json',
  autosave: true,
  autoload: true,
})

const db = create({
  schema: {
    id: 'string',
    title: 'string',
    content: 'string',
    embedding: 'vector[384]',
  },
  plugins: [persistencePlugin],
})

// Example: Reindex all markdown files
async function reindexMarkdownFiles(files: Array<{id: string, title: string, content: string}>) {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2')
  for (const file of files) {
    const embedding = (await embedder(file.content))[0]
    await insert(db, { ...file, embedding })
  }
}
```

### find(queries: string[] | string, options?: object)

Accepts one or more search strings or vectors. Returns a ranked list of results (file, snippet, score).

```typescript
import { search } from '@orama/orama'

const results = await search(db, {
  term: 'search query',
  mode: 'hybrid', // 'vector', 'fulltext', or 'hybrid'
  vector: {
    value: queryEmbedding, // computed embedding for query
    property: 'embedding',
  },
  similarity: 0.8,
  limit: 10,
})
```

### clear()

Clears all stored vector data and stops any indexing/search processes.

```typescript
// Remove all documents (example)
for (const doc of await db.all()) {
  await remove(db, doc.id)
}
```

### insert(document)

Add a new document with embedding to the database.

```typescript
await insert(db, {
  id: 'unique-id',
  title: 'Document Title',
  content: 'Document content',
  embedding: [0.1, 0.2, ...], // vector
})
```

### delete(id)

Remove a document by ID.

```typescript
await remove(db, 'unique-id')
```

### update(id, partialDocument)

Update a document's metadata or embedding.

```typescript
await update(db, 'unique-id', { title: 'New Title' })
```

## Disk Persistence

- All Orama database files are stored in the `.orama/` directory.
- Use the persistence plugin for autosave/autoload.
- Example configuration:

```typescript
const persistencePlugin = await pluginDataPersistence({
  path: './.orama/orama-index.json',
  autosave: true,
  autoload: true,
})
```

## Acceptance Criteria

- [ ] The tool uses Orama for all vector operations.
- [ ] All data is stored in `.orama/` for disk persistence.
- [ ] The tool supports reindex, find, clear, insert, delete, and update operations.
- [ ] Embeddings are generated locally or via plugins.
- [ ] No cloud or external API is required.
- [ ] All outputs are human-readable and agent/command friendly.

## Example Usage

- **Reindex:**  
  `reindex()`  
  Output: `Indexed 42 markdown files.`

- **Find:**  
  `find('semantic search query')`  
  Output:  
  ```
  [
    { file: 'pages/foo.md', snippet: '...', score: 0.92 },
    { file: 'pages/bar.md', snippet: '...', score: 0.87 }
  ]
  ```

- **Clear:**  
  `clear()`  
  Output: `All vector data cleared.`

- **Insert:**  
  `insert({ id: 'baz', title: 'Baz', content: '...', embedding: [...] })`  
  Output: `Document 'baz' inserted.`

- **Delete:**  
  `delete('baz')`  
  Output: `Document 'baz' deleted.`

- **Update:**  
  `update('baz', { title: 'Baz Updated' })`  
  Output: `Document 'baz' updated.`

## Out of Scope

- Cloud-based vector storage.
- Non-local embeddings.
- Advanced querying/filtering beyond Orama's API.

## References

- [Orama Docs](https://orama.dev/docs/introduction)
- [Orama Plugins](https://orama.dev/docs/plugins/overview)
- [Persistence Plugin](https://orama.dev/docs/plugins/persistence)
- [Embeddings Plugin](https://orama.dev/docs/plugins/embeddings)

---
