# vector-db Tool Specification

## Overview

`vector-db` is a persistent, SQLite-backed vector store for retrieval-augmented generation (RAG) and semantic search. It is similar in interface to the `key-value-store` tool, but stores a key, value, and an embedding vector (using Xenova/all-MiniLM-L6-v2, 384-dim) for each entry. It supports similarity search using the sqlite-vec extension and generates embeddings via @xenova/transformers.

## Functional Goals

- Store a row with a UUID `key`, `embedding_text`, `value`, and embedding vector (Xenova/all-MiniLM-L6-v2, 384-dim) in SQLite.
- On store, automatically generate the embedding vector from the `embedding_text` and assign a UUID `key`.
- Retrieve value by UUID `key` (exact match).
- Delete by UUID `key`.
- List all rows (optionally with pagination or limit), returning all fields.
- Similarity search: Given a string, embed it and return the N most similar items (configurable N, default 5), sorted by cosine similarity (lower = more similar).
- Allow setting the database file path.

## Non-Functional Goals

- Use the sqlite-vec extension for vector storage and similarity search.
- Use @xenova/transformers for embedding generation (Xenova/all-MiniLM-L6-v2 model).
- Provide clear, human-readable output.
- Follow opencode custom tool and code standards (Zod validation, tool() helper, etc.).
- Be robust to errors (e.g., missing extension, invalid input).
- Document all arguments and actions.
- Work in Bun runtime without GPU requirements.
- Support fully offline operation after initial model download.

## Actions and Arguments

### import_file
- **Description:** Import a file by reading its contents and storing a vector. The key will be the file contents, and the value will be the file path.
- **Arguments:**
  - `filepath` (string, required): The path to the file to import.
- **Returns:** Confirmation message or error.

### store
- **Description:** Store an embedding_text-value pair, automatically embedding the embedding_text. Returns a UUID `key` for the row.
- **Arguments:**
  - `embedding_text` (string, required): The text to embed and use for storage.
  - `value` (string, required): The value to store.
- **Returns:** The UUID `key` for the row.

### retrieve
- **Description:** Retrieve the value for a given row by UUID `key` (exact match).
- **Arguments:**
  - `key` (string, required): The UUID key to retrieve.
- **Returns:** The value or a not-found message.

### delete
- **Description:** Delete a row by UUID `key`.
- **Arguments:**
  - `key` (string, required): The UUID key to delete.
- **Returns:** The deleted key or warning if not found.

### list
- **Description:** List all rows (optionally paginated).
- **Arguments:**
  - `limit` (number, optional): Max number of rows to return (default: 50).
  - `offset` (number, optional): Offset for pagination (default: 0).
- **Returns:** Array of objects: `{ key, embedding_text, value, embedding }`.

### search
- **Description:** Similarity search for the most similar rows to a query string.
- **Arguments:**
  - `query` (string, required): The search string to embed and compare.
  - `topK` (number, optional): Number of results to return (default: 5).
- **Returns:** Array of objects: `{ key, embedding_text, value, score }` sorted by similarity (lower score = more similar).

### set_database
- **Description:** Set the database file path.
- **Arguments:**
  - `filename` (string, required): Path to the SQLite database file.
- **Returns:** Confirmation message.

## Migration Note

- On upgrade, all existing rows are assigned a UUID `key` if missing.

## SQLite Engine and Extension Loading

- The tool must set the custom SQLite3 engine path for maximum extension compatibility (e.g., Homebrew SQLite on macOS, as in `key-value-store.ts`).
- The tool must load the `vec0` (sqlite-vec) extension before any table creation or vector operations.
- If the engine or extension is missing or fails to load, the tool must return a clear, human-readable error and not proceed with vector operations.
- These steps are required for all actions that interact with the database.

## SQLite Schema

```
CREATE TABLE IF NOT EXISTS vector_store (
  key TEXT PRIMARY KEY, -- UUID
  embedding_text TEXT UNIQUE,
  value TEXT,
  embedding VECTOR(384)
);
```

Note: HNSW indexing is not used in the current implementation as it caused compatibility issues.

## Embedding and Similarity Search Implementation

### Embedding Generation
- Embeddings are generated using @xenova/transformers with the Xenova/all-MiniLM-L6-v2 model
- The embedding pipeline is cached as a singleton for performance
- Embeddings are 384-dimensional Float32Arrays

### Insert with Embedding
Generate an embedding for a key and insert it with its value:

```typescript
// Generate embedding
const embedding = await generateEmbedding(embedding_text);
const embeddingArray = Array.from(embedding);
const embeddingJson = JSON.stringify(embeddingArray);

// Insert into database
db.query(
  `INSERT INTO vector_store (embedding_text, value, embedding) 
   VALUES (?1, ?2, vec_f32(?3))
   ON CONFLICT(embedding_text) DO UPDATE SET value=excluded.value, embedding=excluded.embedding`
).run(embedding_text, value, embeddingJson);
```

### Similarity Search
Find the top K most similar entries to a query string (lower score = more similar):

```typescript
// Generate query embedding
const queryEmbedding = await generateEmbedding(query);
const embeddingJson = JSON.stringify(Array.from(queryEmbedding));

// Perform similarity search
const rows = db.query(
  `SELECT
    embedding_text,
    value,
    vec_distance_cosine(embedding, vec_f32(?1)) AS score
  FROM vector_store
  ORDER BY score ASC
  LIMIT ?2`
).all(embeddingJson, topK);
```

## Error Handling
- All actions must validate input and return clear error messages for missing/invalid arguments.
- Handle errors for missing sqlite-vec extension, Nomic model, or database issues.
- Return human-readable errors for all operational failures.

## Output Format
- All outputs must be human-readable and consistent with opencode tool standards.
- For `list` and `search`, return JSON arrays. For `list`, each result object has `key`, `embedding_text`, `value`, and `embedding`. For `search`, each result object has `key`, `embedding_text`, `value`, and `score`.

## Usage Examples

### Import a file
```
{
  "action": "import_file",
  "filepath": "/path/to/file.txt"
}
```

### Store an embedding_text-value pair
```
{
  "action": "store",
  "embedding_text": "apple computer",
  "value": "fruit company / hardware vendor"
}
```
**Returns:**
```
"a1b2c3d4-...-e5f6"
```
(UUID key for the row)


### Retrieve a value
```
{
  "action": "retrieve",
  "key": "a1b2c3d4-...-e5f6"
}
```
**Returns:**
```
"fruit company / hardware vendor"
```


### Delete a row
```
{
  "action": "delete",
  "key": "a1b2c3d4-...-e5f6"
}
```
**Returns:**
```
"a1b2c3d4-...-e5f6"
```


### List rows
```
{
  "action": "list",
  "limit": 10
}
```
**Returns:**
```
[
  {
    "key": "a1b2c3d4-...-e5f6",
    "embedding_text": "apple computer",
    "value": "fruit company / hardware vendor",
    "embedding": [ ... ]
  },
  ...
]
```


### Similarity search
```
{
  "action": "search",
  "query": "fruit drink",
  "topK": 5
}
```
**Returns:**
```
[
  {
    "key": "a1b2c3d4-...-e5f6",
    "embedding_text": "apple computer",
    "value": "fruit company / hardware vendor",
    "score": 0.1234
  },
  ...
]
```


### Set database path
```
{
  "action": "set_database",
  "filename": "/path/to/vector-db.sqlite"
}
```

## Testing Requirements
- Unit and integration tests for all actions, including edge cases and error handling. This includes tests for `import_file` (valid file, missing file, empty file, binary file, etc.).
- Test with valid and invalid inputs.
- Test database initialization, switching, and extension loading.

## Limitations
- Requires sqlite-vec extension to be available in `./lib/vec0.dylib`.
- Requires @xenova/transformers package to be installed.
- Only supports text embedding_texts and values.
- Embedding dimension is fixed at 384 (Xenova/all-MiniLM-L6-v2).
- First run will download the model (~90MB) to local cache (`~/.cache/huggingface`).
- Subsequent runs are fully offline.

## Dependencies
- `@xenova/transformers` - For embedding generation
- `bun:sqlite` - SQLite database interface
- `sqlite-vec` extension - For vector storage and similarity search

## References
- See `docs/guides/sqlite3-vector-sec-example.md` for SQL usage examples.
- See `tool/key-value-store.ts` for interface inspiration.
- @xenova/transformers: https://github.com/xenova/transformers.js
