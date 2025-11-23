Below is a **minimal, production-correct SQLite schema and usage pattern** using
**sqlite-vec** for a table with:

- `key` (text input)
- `vector` (embedding generated from key)
- `value` (arbitrary associated data)

Examples include **table creation**, **insert**, and **similarity search**.

All SQL is directly runnable in `sqlite3` after:

```sql
.load ./sqlite-vec.dylib
```

---

# ✅ 1. Create the table

```sql
CREATE TABLE kv_vectors (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT,
    vector VECTOR(768)  -- 768 = dimension of Nomic Embed Text v1.5
);
```

If you use a different model, adjust the vector dimension.

---

# ✅ 2. Insert a row (generate vector from key text)

sqlite-vec embeds directly inside SQL:

```sql
INSERT INTO kv_vectors (key, value, vector)
VALUES (
    'apple computer',
    'fruit company / hardware vendor',
    vec_embedding('text-embedding-nomic-embed-text-v1.5', 'apple computer')
);
```

Another example:

```sql
INSERT INTO kv_vectors (key, value, vector)
VALUES (
    'banana smoothie',
    'food / recipe',
    vec_embedding('text-embedding-nomic-embed-text-v1.5', 'banana smoothie')
);
```

---

# ✅ 3. Similarity search (Cosine distance)

Query:

```sql
SELECT
    id,
    key,
    value,
    distance(
        vector,
        vec_embedding('text-embedding-nomic-embed-text-v1.5', 'search text')
    ) AS score
FROM kv_vectors
ORDER BY score ASC
LIMIT 5;
```

Example search:

```sql
SELECT
    id, key, value, distance(
        vector,
        vec_embedding('text-embedding-nomic-embed-text-v1.5', 'fruit drink')
    ) AS score
FROM kv_vectors
ORDER BY score
LIMIT 5;
```

---

# 📌 Notes on `distance()`

`distance()` defaults to **cosine distance** for embedding vectors. Lower score =
more similar.

---

# ✅ 4. Optional: add an ANN index (HNSW)

For faster searches on large datasets:

```sql
CREATE INDEX kv_vectors_hnsw ON kv_vectors(vector)
USING hnsw;
```

This significantly speeds up high-volume similarity queries.

---

# Full Example: All Steps Together

```sql
.load ./sqlite-vec.dylib

-- 1. Table
CREATE TABLE kv_vectors (
    id INTEGER PRIMARY KEY,
    key TEXT NOT NULL,
    value TEXT,
    vector VECTOR(768)
);

-- (Optional) fast ANN index
CREATE INDEX kv_vectors_hnsw ON kv_vectors(vector) USING hnsw;

-- 2. Insert rows
INSERT INTO kv_vectors (key, value, vector)
VALUES (
    'apple computer',
    'fruit company / hardware vendor',
    vec_embedding('text-embedding-nomic-embed-text-v1.5', 'apple computer')
);

INSERT INTO kv_vectors (key, value, vector)
VALUES (
    'banana smoothie',
    'food / recipe',
    vec_embedding('text-embedding-nomic-embed-text-v1.5', 'banana smoothie')
);

INSERT INTO kv_vectors (key, value, vector)
VALUES (
    'strawberry fruit',
    'just a fruit',
    vec_embedding('text-embedding-nomic-embed-text-v1.5', 'strawberry fruit')
);

-- 3. Similarity Search
SELECT
    id,
    key,
    value,
    distance(
        vector,
        vec_embedding('text-embedding-nomic-embed-text-v1.5', 'fruit drink')
    ) AS score
FROM kv_vectors
ORDER BY score
LIMIT 5;
```

---

# If you want, I can also provide:

- Version using stored embeddings and **parameterized inserts** for your runtime
  (Rust, Node, Go, etc.)
- A reusable SQL view for similarity search
- A chunking + embedding pipeline for documents
- A “KV + vector index” optimized schema for high-load applications

Just tell me the environment.
