# SQL Antipattern: Relational Division

## 1. Objective: Matching a List of Values

**Goal:** Find entities (such as users, products, or orders) that are associated with
_all_ items in a given list. For example, finding users who possess _all_ required
skills, or products tagged with _all_ selected categories.

**Example Scenario:** Suppose you want to find all users who have the skills `'SQL'`,
`'Python'`, and `'Docker'`.

**Typical Data Model:**

```sql
CREATE TABLE user_skills (
  user_id INT,
  skill VARCHAR(50)
);
```

---

## 2. Antipattern: Searching Multiple Rows in a WHERE Clause

**Description:** Developers often attempt to match multiple values by chaining `OR`
conditions or using `IN`, but these only check for _any_ match, not _all_.

**Antipattern Example:**

```sql
-- Find users who have 'SQL', 'Python', and 'Docker'
SELECT user_id
FROM user_skills
WHERE skill IN ('SQL', 'Python', 'Docker');
```

**Problem:** This query returns users who have _any_ of the skills, not _all_.

**Incorrect Attempt:**

```sql
SELECT user_id
FROM user_skills
WHERE skill = 'SQL'
  AND skill = 'Python'
  AND skill = 'Docker';
```

**Problem:** No row can have `skill` equal to all three values at once, so this
returns nothing.

---

## 3. How to Recognize the Antipattern

**Symptoms:**

- Use of `IN` or multiple `OR` conditions for multi-value matching.
- Expecting a single row to satisfy all conditions simultaneously.
- Queries that return too many or too few results.
- Poor performance due to lack of set-based logic.

**Checklist:**

- Are you trying to match _all_ values from a list?
- Does your query use `WHERE ... IN (...)` or chained `OR`?
- Are you filtering on the same column for multiple values?

---

## 4. Legitimate Uses of the Antipattern

**When It's Okay:**

- When you want to match _any_ value from a list (not all).
- For existence checks, e.g., "users with _any_ of these skills".

**Example:**

```sql
SELECT user_id
FROM user_skills
WHERE skill IN ('SQL', 'Python', 'Docker');
```

**Advice:** If your business logic truly only requires _any_ match, this is fine.

---

## 5. Solution: Using Relational Division

**Relational Division:** Find entities associated with _all_ items in a list by
counting matches and comparing to the list size.

**Correct SQL Example:**

```sql
-- Find users who have ALL skills in the required set
SELECT user_id
FROM user_skills
WHERE skill IN ('SQL', 'Python', 'Docker')
GROUP BY user_id
HAVING COUNT(DISTINCT skill) = 3;
```

**Explanation:**

- `GROUP BY user_id` groups skills per user.
- `HAVING COUNT(DISTINCT skill) = 3` ensures user has all three skills.

**Performance Considerations:**

- Index `user_skills(skill)` and/or `user_skills(user_id)` for faster grouping.
- Avoid subqueries if possible; set-based logic is faster.

**Advanced: Dynamic Skill List**

```sql
-- Use a subquery for a dynamic skill list
SELECT user_id
FROM user_skills
WHERE skill IN (SELECT skill FROM required_skills)
GROUP BY user_id
HAVING COUNT(DISTINCT skill) = (SELECT COUNT(*) FROM required_skills);
```

---

## 6. Mini-Antipattern: Aggregation Functions in the WHERE Clause

**Description:** Using aggregation functions (`COUNT`, `SUM`, etc.) in the `WHERE`
clause instead of `HAVING`.

**Antipattern Example:**

```sql
SELECT user_id
FROM user_skills
WHERE COUNT(skill) = 3 -- INVALID!
GROUP BY user_id;
```

**Problem:** Aggregates cannot be used in `WHERE`, only in `HAVING`.

**Correct Usage:**

```sql
SELECT user_id
FROM user_skills
GROUP BY user_id
HAVING COUNT(DISTINCT skill) = 3;
```

**Advice:** Always use `HAVING` for conditions on aggregate results.

---

## Best Practices & Common Pitfalls

**Best Practices:**

- Use `GROUP BY` and `HAVING` for set-matching.
- Index relevant columns for performance.
- Use `COUNT(DISTINCT ...)` for unique matches.
- Prefer set-based logic over row-by-row checks.

**Common Pitfalls:**

- Using `IN` or `OR` when you need _all_ values matched.
- Filtering on the same column for multiple values in `WHERE`.
- Using aggregates in `WHERE` instead of `HAVING`.
- Not accounting for missing values (users missing one skill).

---

## References & Further Reading

- [SQL Antipatterns: Avoiding the Pitfalls of Database Programming (Bill Karwin)](https://karwin.com/sqlantipatterns/)
- [Relational Division Explained (Database Journal)](https://www.databasejournal.com/features/mssql/relational-division/)
- [Stack Overflow: Relational Division in SQL](https://stackoverflow.com/questions/1867696/relational-division-in-sql)
- [PostgreSQL Wiki: Relational Division](https://wiki.postgresql.org/wiki/Relational_Division)
- [SQL Performance: GROUP BY and HAVING](https://use-the-index-luke.com/sql/aggregate-functions/group-by-having)

---

## Citation List

1. [SQL Antipatterns: Avoiding the Pitfalls of Database Programming](https://karwin.com/sqlantipatterns/)
2. [Relational Division Explained — Database Journal](https://www.databasejournal.com/features/mssql/relational-division/)
3. [Stack Overflow: Relational Division in SQL](https://stackoverflow.com/questions/1867696/relational-division-in-sql)
4. [PostgreSQL Wiki: Relational Division](https://wiki.postgresql.org/wiki/Relational_Division)
5. [Use the Index, Luke! — GROUP BY and HAVING](https://use-the-index-luke.com/sql/aggregate-functions/group-by-having)

---

**End of Guide**
