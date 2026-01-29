# SQL Antipattern Guide: "JSON: Matryoshka Dolls"

## 1. Objective: Unlimited Flexibility

Developers often seek maximum flexibility in their database schema to accommodate
evolving requirements, custom fields, or unpredictable data structures. Storing JSON
in relational databases allows for arbitrary, nested data without frequent schema
migrations.

**Typical motivations:**

- User profiles with customizable fields
- Event logs with variable attributes
- Product attributes that differ per category

## 2. Antipattern: Semi-Structured Data in a Relational Database

Instead of normalizing data into tables and columns, developers use a single JSON
column to store complex, nested objects—sometimes recursively—like Russian Matryoshka
dolls. This undermines the strengths of relational databases.

**Why it's problematic:**

- Defeats relational integrity and type enforcement
- Makes querying, updating, and indexing difficult
- Hides data from the optimizer and reporting tools

**Antipattern Example (PostgreSQL):**

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT,
  profile JSONB -- Arbitrary nested fields
);

-- Inserting deeply nested data
INSERT INTO users (name, profile) VALUES (
  'Alice',
  '{
    "address": {
      "street": "123 Main St",
      "city": "Springfield",
      "geo": {
        "lat": 39.78,
        "lng": -89.64
      }
    },
    "preferences": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "sms": false
      }
    }
  }'
);
```

## 3. How to Recognize the Antipattern

**Signs:**

- JSON columns contain deeply nested, recursive structures
- Most queries use JSON extraction functions (`->`, `->>`, `json_extract`)
- Lack of foreign keys, constraints, or normalization
- Schema rarely changes, but application code to parse JSON is complex
- Reporting and analytics require heavy JSON parsing

**Detection Query Example (PostgreSQL):**

```sql
SELECT profile
FROM users
WHERE profile->'preferences'->>'theme' = 'dark';
```

_If most queries look like this, you might be overusing JSON._

## 4. Legitimate Uses of the Antipattern

**Appropriate scenarios:**

- Logging events with unpredictable attributes
- Storing external payloads (webhooks, third-party data)
- Prototyping new features before schema is finalized
- Custom fields or metadata for limited scope

**Legitimate Example (PostgreSQL):**

```sql
CREATE TABLE audit_log (
  id SERIAL PRIMARY KEY,
  event_time TIMESTAMPTZ,
  event_type TEXT,
  payload JSONB -- External data, not for frequent querying
);

-- Storing webhook payload
INSERT INTO audit_log (event_time, event_type, payload) VALUES (
  NOW(), 'webhook_received', '{"external_id": 123, "details": {"foo": "bar"}}'
);
```

## 5. Solution: Be Mindful and Moderate About Flexibility

**Guidelines:**

- Use JSON columns for truly dynamic or external data only
- Normalize frequently queried or relational data
- Use generated columns or indexes for common JSON attributes
- Document the intended use and limitations

**Hybrid Approach Example (PostgreSQL):**

```sql
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT,
  price NUMERIC,
  attributes JSONB -- Only for rarely accessed, custom fields
);

-- Indexing a common attribute
CREATE INDEX idx_products_color ON products ((attributes->>'color'));

-- Querying indexed attribute
SELECT * FROM products WHERE attributes->>'color' = 'red';
```

## 6. Mini-Antipattern: Quotes for All Occasions

**Problem:** Storing all values as strings (quotes everywhere), even when they
represent numbers, dates, or booleans. This leads to type confusion and inefficient
queries.

**Bad Example:**

```json
{
  "age": "30",
  "active": "true",
  "signup_date": "2023-01-01"
}
```

**Better Example:**

```json
{
  "age": 30,
  "active": true,
  "signup_date": "2023-01-01"
}
```

_Use correct JSON types to avoid conversion headaches._

---

## Pros and Cons of Storing JSON in Relational Databases

### Pros

- **Flexibility:** Schema-less storage for dynamic data
- **Rapid prototyping:** Add new fields without migrations
- **Third-party data:** Store external payloads as-is

### Cons

- **Query complexity:** Harder to filter, join, and aggregate
- **Performance:** Slower queries, less efficient indexing
- **Data integrity:** No type enforcement or constraints
- **Reporting:** Difficult for BI tools and analytics

---

## When JSON Columns Are Appropriate vs. Misused

| Appropriate Use Cases    | Misuse/Antipattern Cases          |
| ------------------------ | --------------------------------- |
| External payloads        | Core business data                |
| Occasional custom fields | Frequently queried attributes     |
| Logging, auditing        | Relational data with dependencies |
| Prototyping              | Production, long-term storage     |

---

## Code Examples: Antipatterns and Proper Usage

### Antipattern: Deeply Nested JSON for Relational Data

```sql
-- Bad: Orders stored as JSON in a single column
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  order_data JSONB
);

-- Querying for customer name
SELECT order_data->'customer'->>'name' FROM orders;
```

### Proper Usage: Normalized Structure with JSON for Metadata

```sql
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name TEXT,
  email TEXT
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  customer_id INT REFERENCES customers(id),
  order_date DATE,
  metadata JSONB -- Only for non-relational, custom info
);

-- Querying for customer name (efficient)
SELECT c.name, o.order_date
FROM orders o
JOIN customers c ON o.customer_id = c.id;
```

---

## Performance Implications

- **Querying JSON:** Slower than querying native columns, especially for deep or
  recursive structures
- **Indexing:** Limited; functional indexes help but don't match native column
  performance
- **Storage:** JSONB (Postgres) is more efficient than JSON (MySQL/Postgres), but
  still larger than normalized data

**Indexing JSON Example (PostgreSQL):**

```sql
-- Index on a JSON attribute
CREATE INDEX idx_orders_status ON orders ((order_data->>'status'));

-- Query uses index
SELECT * FROM orders WHERE order_data->>'status' = 'shipped';
```

**MySQL Example:**

```sql
-- Generated column for indexing
ALTER TABLE orders ADD COLUMN status VARCHAR(20) GENERATED ALWAYS AS (JSON_UNQUOTE(order_data->'$.status')) STORED;
CREATE INDEX idx_orders_status ON orders(status);
```

---

## Best Practices for Semi-Structured Data

- Limit JSON usage to truly flexible or external data
- Normalize relational and frequently queried data
- Use generated columns or functional indexes for common JSON attributes
- Validate JSON structure at application level
- Document what goes into JSON columns and why
- Avoid deeply nested or recursive structures
- Use correct JSON types (numbers, booleans, dates)
- Monitor query performance and refactor if JSON queries become frequent

---

## Citations

- [PostgreSQL: JSON Types](https://www.postgresql.org/docs/current/datatype-json.html)
- [MySQL: JSON Data Type](https://dev.mysql.com/doc/refman/8.0/en/json.html)
- [SQL Antipatterns Book by Bill Karwin](https://pragprog.com/titles/bksqla/sql-antipatterns/)
- [PostgreSQL: Indexing JSON Data](https://www.postgresql.org/docs/current/datatype-json.html#JSON-INDEXING)
- [MySQL: Indexing JSON Documents](https://dev.mysql.com/doc/refman/8.0/en/json.html#json-indexing)
- [Best Practices for Storing Semi-Structured Data](https://www.citusdata.com/blog/2016/06/16/five-ways-to-search-and-index-json-data-in-postgres/)

---

## Further Reading

- [JSON in SQL: When, Why, and How](https://www.crunchydata.com/blog/json-in-postgres-when-why-and-how)
- [SQL Antipatterns: Avoiding the Pitfalls](https://dataedo.com/blog/sql-antipatterns-and-how-to-avoid-them)
- [PostgreSQL: Using JSONB for Flexible Schemas](https://www.cybertec-postgresql.com/en/jsonb-postgresql-how-to-use/)
