# Guide to the SQL Antipattern: Pagination: Take It from the Top

## 1. Objective: Presenting Query Results in Pages

Paginated queries are essential for displaying large datasets in manageable chunks,
improving user experience and reducing resource consumption. Pagination allows users
to navigate through data efficiently, especially in web applications and reporting
tools.

**Example: Basic SQL Pagination Query**

```sql
SELECT * FROM products
ORDER BY id
LIMIT 10 OFFSET 20;
```

**Performance Considerations:**

- Pagination reduces the amount of data transferred per request.
- However, improper pagination can lead to performance bottlenecks as data grows.

**Common Pitfalls:**

- Using inefficient pagination strategies can slow down queries.

**Best Practices:**

- Always use an ORDER BY clause for predictable results.

---

## 2. Antipattern: Mistaking Offset for Optimization

The common antipattern is relying on `OFFSET` for pagination, assuming it is
efficient for large datasets. While `OFFSET` skips rows, the database still scans and
counts all skipped rows, leading to poor performance as the offset increases.

**Antipattern Example:**

```sql
SELECT * FROM orders
ORDER BY created_at
LIMIT 10 OFFSET 10000;
```

**Why OFFSET is Problematic:**

- The database must scan and discard all rows before the offset, causing slow queries
  for high offsets.
- Users may experience delays or timeouts on deep pages.

**Performance Considerations:**

- Query time increases linearly with the offset value.

**Common Pitfalls:**

- Assuming OFFSET is scalable for any dataset size.

---

## 3. How to Recognize the Antipattern

**Signs in Codebases:**

- Frequent use of `LIMIT ... OFFSET ...` in queries for pagination.
- Slow response times for pages with high offsets.

**Detectable Usage Example:**

```sql
SELECT * FROM logs
ORDER BY timestamp DESC
LIMIT 50 OFFSET 5000;
```

**Checklist to Identify:**

- Are queries using OFFSET for deep pagination?
- Is performance degrading as users navigate to later pages?

**Common Pitfalls:**

- Not monitoring query performance for high offsets.

**Best Practices:**

- Profile queries and test with large offsets.

---

## 4. Legitimate Uses of the Antipattern

There are scenarios where OFFSET/LIMIT is acceptable:

- Small datasets where performance impact is negligible.
- Administrative tools or reports where deep pagination is rare.
- Quick prototyping or internal tools.

**Acceptable Usage Example:**

```sql
SELECT * FROM users
ORDER BY username
LIMIT 20 OFFSET 40;
```

**Best Practices:**

- Limit use to small tables or infrequent queries.

**Performance Considerations:**

- Monitor query plans and execution times.

**Common Pitfalls:**

- Using OFFSET/LIMIT in high-traffic or large-scale applications.

---

## 5. Solution: Changing the Rules

For scalable pagination, use keyset or cursor-based pagination. These methods avoid
scanning skipped rows and provide consistent performance regardless of page depth.

**Keyset Pagination Example:**

```sql
-- Fetch the next page after the last seen id
SELECT * FROM products
WHERE id > 100
ORDER BY id
LIMIT 10;
```

**Cursor-Based Pagination Example:**

```sql
-- Using a cursor value (e.g., last timestamp)
SELECT * FROM events
WHERE timestamp < '2024-01-01T12:00:00'
ORDER BY timestamp DESC
LIMIT 50;
```

**Performance Comparison:**

- Keyset/cursor-based pagination uses indexed columns to jump directly to the next
  set of rows.
- Query time remains constant regardless of page depth.

**Migration Guidance:**

1. Identify a unique, indexed column for pagination (e.g., id, timestamp).
2. Refactor queries to use WHERE clauses for page boundaries.
3. Update application logic to track the last seen value.

**Best Practices:**

- Use keyset pagination for large tables and user-facing features.
- Ensure the pagination column is indexed and unique.

**Common Pitfalls:**

- Choosing non-unique or non-indexed columns for keyset pagination.
- Failing to handle deleted or missing rows.

---

## 6. Mini-Antipattern: LIMIT without ORDER BY

Using LIMIT without ORDER BY can return unpredictable results, as row order is not
guaranteed unless explicitly specified.

**Problematic Example:**

```sql
SELECT * FROM customers
LIMIT 10;
```

**Proper Solution Example:**

```sql
SELECT * FROM customers
ORDER BY signup_date DESC
LIMIT 10;
```

**Common Pitfalls:**

- Assuming default row order is meaningful.

**Best Practices:**

- Always use ORDER BY with LIMIT to ensure consistent results.

**Performance Considerations:**

- ORDER BY on indexed columns is efficient; avoid ordering on non-indexed columns for
  large tables.

---

## Summary & Next Steps

This guide covered the SQL antipattern "Pagination: Take It from the Top,"
highlighting:

- The objective and importance of pagination
- Why OFFSET-based pagination is problematic
- How to recognize and avoid the antipattern
- Legitimate use cases for OFFSET/LIMIT
- Scalable solutions with keyset/cursor-based pagination
- The risks of using LIMIT without ORDER BY

**Next Steps:**

- Audit your queries for OFFSET/LIMIT usage
- Refactor to keyset/cursor-based pagination where appropriate
- Monitor query performance and user experience
- Educate your team on pagination best practices
