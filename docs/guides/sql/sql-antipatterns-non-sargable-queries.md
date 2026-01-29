# Comprehensive Guide to SQL Antipattern: Non-Sargable Queries

---

## Objective: Optimizing Complex Queries

Efficient SQL queries are critical for scalable applications. The objective is to
write queries that leverage indexes, minimize resource usage, and return results
quickly—even as data grows. Non-sargable queries are a common antipattern that
prevents the database engine from using indexes, resulting in slow performance and
unnecessary load.

---

## Antipattern: Using Queries That Can't Be Optimized

A non-sargable query is one where the database cannot use indexes to efficiently
locate rows. "SARGABLE" stands for "Search ARGument ABLE"—meaning the query's search
arguments are written so the engine can use an index. Non-sargable queries force full
table scans, which are slow and resource-intensive.

**Common causes:**

- Functions on indexed columns
- Implicit type conversions
- Leading wildcards in LIKE
- OR conditions across different columns

---

## How to Recognize the Antipattern

**Signs of non-sargable queries:**

- Functions applied to columns in WHERE/JOIN clauses
- Implicit type conversions between columns and literals
- Leading wildcards in LIKE patterns
- OR conditions across different columns
- Expressions on the left side of comparisons

**How to check:**

- Use `EXPLAIN` or query plans to see if indexes are used
- Look for "table scan" or "index scan" vs. "index seek"

### Example: Sargable vs Non-Sargable

```sql
-- Sargable: Index on 'created_at' can be used
SELECT * FROM orders WHERE created_at >= '2024-01-01';

-- Non-Sargable: Function prevents index usage
SELECT * FROM orders WHERE YEAR(created_at) = 2024;
```

---

## Legitimate Uses of the Antipattern

Sometimes, non-sargable queries are necessary due to business logic or requirements:

- Searching for substrings (`LIKE '%pattern%'`)
- Calculating derived values not stored in columns
- Ad-hoc reporting or analytics

**Tip:** Accept the performance penalty only when necessary, and consider
alternatives (e.g., full-text search).

---

## Solution: Refactoring the Query

### General Strategies

- **Avoid functions on columns:** Rewrite conditions to use ranges
- **Match data types:** Ensure columns and literals are of the same type
- **Avoid leading wildcards:** Use prefix searches or full-text indexes
- **Split OR conditions:** Use UNION or indexed views
- **Move expressions to the right:** Keep columns on the left in comparisons

### Refactored Examples

#### Functions on Indexed Columns

```sql
-- Antipattern
SELECT * FROM orders WHERE DATE(order_date) = '2024-01-01';

-- Refactored
SELECT * FROM orders
WHERE order_date >= '2024-01-01'
  AND order_date < '2024-01-02';
```

#### Implicit Type Conversions

```sql
-- Antipattern
SELECT * FROM users WHERE user_id = '123';

-- Refactored
SELECT * FROM users WHERE user_id = 123;
```

#### Leading Wildcards in LIKE

```sql
-- Antipattern
SELECT * FROM users WHERE email LIKE '%@gmail.com';

-- Refactored
SELECT * FROM users WHERE email LIKE 'john.doe%';
```

#### OR Conditions Across Columns

```sql
-- Antipattern
SELECT * FROM orders WHERE customer_id = 123 OR order_date = '2024-01-01';

-- Refactored
SELECT * FROM orders WHERE customer_id = 123
UNION
SELECT * FROM orders WHERE order_date = '2024-01-01';
```

---

## Mini-Antipattern: Redundant Indexes

Creating multiple indexes to "fix" non-sargable queries is ineffective. Indexes only
help when queries are sargable. Redundant indexes waste space and slow down writes.

**Best Practice:** Refactor queries before adding indexes. Use indexes only when
queries are sargable and benefit from them.

---

## Performance Considerations

- Sargable queries allow the database to use index seeks, which are fast and scale
  well.
- Non-sargable queries force table scans or index scans, which are slow and
  resource-intensive.
- Use `EXPLAIN` plans to verify index usage.
- Avoid unnecessary indexes—focus on query refactoring first.

---

## Best Practices

- Write sargable queries: Keep columns on the left, avoid functions and conversions.
- Use appropriate data types: Ensure consistency between columns and literals.
- Leverage range conditions: Use BETWEEN, >=, < for dates and numbers.
- Avoid leading wildcards: Use full-text search for substring matching.
- Check execution plans: Use EXPLAIN to verify index usage.
- Refactor ORs: Split into multiple queries if necessary.
- Index wisely: Only index columns used in sargable conditions.

---

## References

- [SQL Performance Explained: SARGable Queries](https://use-the-index-luke.com/sql/where-clause/the-equals-operator/equals-and-in)
- [Brent Ozar: SARGability](https://www.brentozar.com/archive/2013/03/sargability-how-to-make-your-sql-queries-faster/)
- [SQL Server Documentation: SARGable](https://docs.microsoft.com/en-us/sql/relational-databases/performance/sargable-queries)
- [PostgreSQL Indexes and SARGability](https://www.postgresql.org/docs/current/indexes.html)
- [Database Dojo: Non-Sargable Queries](https://databasedojo.com/non-sargable-queries/)

---

**By following these guidelines, you can write efficient, maintainable SQL that
leverages indexes and avoids costly full table scans.**
