# Orama Vector Database: Implementation Guide

## 1. Installation

**NPM (Node.js):**
```bash
npm install orama
```

**Bun:**
```bash
bun add orama
```

**Local-only (no cloud):**
Orama is designed to run locally, with disk persistence and local embeddings available via plugins.

**Official Links:**
- [Orama NPM](https://www.npmjs.com/package/orama)
- [Orama Docs](https://orama.dev/docs/introduction)
- [Orama GitHub](https://github.com/orama-index/orama)

---

## 2. Database Creation, Schema, and Management

**Create a database:**
```js
import { create, insert, search } from 'orama'

const db = await create({
  schema: {
    id: 'string',
    title: 'string',
    content: 'string',
    embedding: 'vector' // if using vector search
  }
})
```

**Schema:**
- Define fields and their types (`string`, `number`, `vector`, etc.).
- For vector search, include a `vector` field.

**Management:**
- Orama is in-memory by default, but supports disk persistence via plugins.

---

## 3. Data Insertion, Removal, Update

**Insert:**
```js
await insert(db, {
  id: '1',
  title: 'Hello World',
  content: 'This is a test',
  embedding: [0.1, 0.2, 0.3, ...] // vector
})
```

**Remove:**
```js
import { remove } from 'orama'
await remove(db, '1') // remove by id
```

**Update:**
```js
import { update } from 'orama'
await update(db, '1', { title: 'Updated Title' })
```

---

## 4. Vector Search and Querying

**Vector Search:**
```js
import { search } from 'orama'
const results = await search(db, {
  term: 'test',
  vector: [0.1, 0.2, 0.3, ...], // query vector
  threshold: 0.8 // similarity threshold
})
```
- Supports hybrid search (text + vector).
- Returns ranked results by similarity.

---

## 5. Plugins System

**Embeddings:**
- Use the embeddings plugin to generate and store vector embeddings locally.
- Example: `@orama/plugin-embeddings-openai` for OpenAI, or local models.

**Persistence:**
- Use the persistence plugin for disk storage.
- Example: `@orama/plugin-persistence-leveldb` for LevelDB-based disk persistence.

**Node-only/local options:**
- Plugins are available for Node.js and Bun.
- Local embeddings and persistence are supported; no cloud required.

---

## 6. Disk Persistence and Local Embeddings

**Disk Persistence:**
```js
import { create } from 'orama'
import { leveldbPersistence } from '@orama/plugin-persistence-leveldb'

const db = await create({
  schema: { ... },
  plugins: [leveldbPersistence({ path: './db' })]
})
```

**Local Embeddings:**
- Use local embedding models or plugins.
- Example: `@orama/plugin-embeddings-local` (if available).

---

## 7. Node vs Bun Differences and Bun-specific Instructions

- Orama works with both Node.js and Bun.
- Bun offers faster startup and native TypeScript support.
- Use `bun add orama` for Bun projects.
- Plugins may have different installation or usage instructions for Bun vs Node.js; check plugin docs.

---

## 8. Code Examples for Each Step

**See above for code snippets.**

---

## 8. Orama API Parameters and Options

### create
- **schema** (object, required): Defines document structure. Example: `{ name: 'string', embedding: 'vector[384]' }`
- **plugins** (array, optional): Plugins for embeddings, persistence, etc.
- **idProperty** (string, optional): Custom property for document IDs.
- **defaultSearchMode** (string, optional): 'fulltext', 'vector', or 'hybrid'.

### insert / insertMultiple
- **db** (Orama instance, required): Database to insert into.
- **document** (object, required): Data matching schema.
- **options** (object, optional): `{ id: 'custom-id' }`

### search
- **db** (Orama instance, required): Database to search.
- **options** (object, required):
  - **term** (string): Query string for full-text search.
  - **mode** (string): 'fulltext', 'vector', 'hybrid'.
  - **vector** (object): `{ value: [embedding], property: 'embedding' }`
  - **similarity** (number): Minimum similarity for vector matches.
  - **includeVectors** (boolean): Include vectors in results.
  - **filters** (object): Filter results by field values.
  - **facets** (array): Return facet counts for fields.
  - **limit** (number): Max results.
  - **offset** (number): Pagination.

### update
- **db** (Orama instance, required): Database to update.
- **id** (string, required): Document ID.
- **partialDocument** (object, required): Fields to update.

### remove
- **db** (Orama instance, required): Database to remove from.
- **id** (string, required): Document ID.

### plugins
- **plugins** (array, required): Plugin instances for embeddings, persistence, etc.

---

## 9. Node Embeddings Setup and Usage

### Installation (Node.js)
```bash
npm install @orama/orama @orama/plugin-embeddings @tensorflow/tfjs-node
```

### Installation (Bun)
```bash
bun add @orama/orama @orama/plugin-embeddings @tensorflow/tfjs
```

### Embeddings Plugin Setup (Local)
```js
import { create } from '@orama/orama'
import { pluginEmbeddings } from '@orama/plugin-embeddings'
import '@tensorflow/tfjs-node' // Node.js only

const embeddingsPlugin = await pluginEmbeddings({
  embeddings: {
    defaultProperty: 'embeddings',
    onInsert: {
      generate: true,
      properties: ['description'],
      verbose: true,
    }
  }
})

const db = create({
  schema: {
    description: 'string',
    embeddings: 'vector[512]'
  },
  plugins: [embeddingsPlugin]
})
```

### Disk Persistence Plugin Setup
```js
import { pluginDataPersistence } from '@orama/plugin-data-persistence'

const persistencePlugin = await pluginDataPersistence({
  path: './orama-index.json',
  autosave: true,
  autoload: true,
})

const db = create({
  schema: {
    description: 'string',
    embeddings: 'vector[512]'
  },
  plugins: [embeddingsPlugin, persistencePlugin]
})
```

---

## 10. Full Example: Inserting Data with Computed Embeddings

```js
const { create, insert } = require('@orama/orama');
const { pipeline } = require('@xenova/transformers');

const products = [
  { name: 'Noise cancelling headphones', description: 'Best noise cancelling headphones on the market', price: 99.99 },
  { name: 'Kids Wired Headphones', description: 'Kids Wired Headphones for School Students K-12', price: 19.99 },
  { name: 'Bose QuietComfort', description: 'Bose QuietComfort Bluetooth Headphones', price: 299.99 }
];

async function getEmbeddings(texts) {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  return Promise.all(texts.map(async text => (await embedder(text))[0]));
}

async function main() {
  const db = create({
    schema: {
      name: 'string',
      description: 'string',
      price: 'number',
      embedding: 'vector[384]'
    }
  });

  const descriptions = products.map(p => p.description);
  const embeddings = await getEmbeddings(descriptions);

  for (let i = 0; i < products.length; i++) {
    await insert(db, {
      ...products[i],
      embedding: embeddings[i]
    });
  }

  console.log('Inserted documents with embeddings!');
}

main();
```

---

## 11. Full Example: Search with Computed Embedding

```js
const { create, insertMultiple, search } = require('@orama/orama');
const { pipeline } = require('@xenova/transformers');

async function getEmbedding(text) {
  const embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  const embedding = await embedder(text, { pooling: 'mean', normalize: true });
  return embedding.data;
}

async function main() {
  const db = create({
    schema: {
      title: 'string',
      embedding: 'vector[384]',
    },
  });

  const docs = [
    { title: 'Noise cancelling headphones', text: 'Best noise cancelling headphones for students.' },
    { title: 'Kids Wired Headphones', text: 'Affordable headphones for school students.' },
    { title: 'Bluetooth Headphones', text: 'Wireless headphones for music lovers.' },
  ];

  for (const doc of docs) {
    doc.embedding = await getEmbedding(doc.text);
  }
  await insertMultiple(db, docs);

  const query = 'Best headphones for students';
  const queryEmbedding = await getEmbedding(query);

  const results = await search(db, {
    mode: 'vector',
    vector: {
      value: queryEmbedding,
      property: 'embedding',
    },
    similarity: 0.8,
    includeVectors: false,
  });

  console.log(results);
}

main();
```

---

## 12. Disk Persistence Best Practices

- Store indexes and embeddings in a dedicated directory.
- Use JSON for indexes, binary for embeddings if supported.
- Implement periodic autosave and autoload from disk on startup.
- Use atomic file operations to avoid corruption.
- Regularly backup your index and embeddings files.
- Monitor disk usage and performance metrics.

---

## 13. Authoritative Links

- [Orama Docs](https://orama.dev/docs/introduction)
- [Orama NPM](https://www.npmjs.com/package/orama)
- [Orama GitHub](https://github.com/orama-index/orama)
- [Orama Plugins](https://orama.dev/docs/plugins/overview)
- [Persistence Plugin](https://orama.dev/docs/plugins/persistence)
- [Embeddings Plugin](https://orama.dev/docs/plugins/embeddings)

---

## 14. Summary Table

| Feature           | Node.js | Bun | Local-only | Disk Persistence | Embeddings   | Cloud Required |
| ----------------- | ------- | --- | ---------- | ---------------- | ------------ | -------------- |
| Installation      | npm     | bun | Yes        | Yes (plugin)     | Yes (plugin) | No             |
| Database Creation | Yes     | Yes | Yes        | Yes              | Yes          | No             |
| Data Operations   | Yes     | Yes | Yes        | Yes              | Yes          | No             |
| Vector Search     | Yes     | Yes | Yes        | Yes              | Yes          | No             |
| Plugins           | Yes     | Yes | Yes        | Yes              | Yes          | No             |

---

## 11. Additional Resources

- [Orama Discord](https://discord.gg/orama) — Community support
- [Orama Blog](https://orama.dev/blog) — Announcements and guides

---

**Note:**
For the most up-to-date and authoritative documentation, please check the official Orama documentation and GitHub when access is restored. All code examples above are based on the latest available knowledge and typical usage patterns.

If you need more details on a specific plugin or feature, let me know and I will attempt to fetch or summarize further!
