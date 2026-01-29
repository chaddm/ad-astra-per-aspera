# SQL Antipattern: Dynamic Pivot

## 1. Objective: Turning the Table

Pivoting is the process of transforming rows into columns, often to create summary
reports or cross-tabulations. In SQL, this means taking values from one column and
turning them into multiple columns, each representing a distinct value. For example,
converting sales data by month into columns for each month.

**Example Table: Sales**

| salesperson | month | amount |
| ----------- | ----- | ------ |
| Alice       | Jan   | 100    |
| Bob         | Jan   | 150    |
| Alice       | Feb   | 120    |
| Bob         | Feb   | 130    |

**Desired Pivoted Output:**

| salesperson | Jan | Feb |
| ----------- | --- | --- |
| Alice       | 100 | 120 |
| Bob         | 150 | 130 |

## 2. Antipattern: Using a Single Query

The Dynamic Pivot antipattern occurs when developers attempt to create a pivot table
with dynamic columns using a single SQL query, often by constructing SQL strings and
executing them with `EXEC` or similar mechanisms. This approach is tempting for
flexibility but introduces maintainability, security, and performance issues.

**Antipattern Example (SQL Server):**

```sql
DECLARE @cols NVARCHAR(MAX), @query NVARCHAR(MAX);
SELECT @cols = STRING_AGG(QUOTENAME(month), ',') FROM (SELECT DISTINCT month FROM Sales) AS months;
SET @query = N'SELECT salesperson, ' + @cols + ' FROM (SELECT salesperson, month, amount FROM Sales) AS src PIVOT (SUM(amount) FOR month IN (' + @cols + ')) AS pvt';
EXEC sp_executesql @query;
```

**Problems:**

- SQL injection risk if not sanitized
- Hard to debug and maintain
- Query plan cannot be cached
- Difficult to audit or optimize

## 3. How to Recognize the Antipattern

Signs you’re using the Dynamic Pivot antipattern:

- SQL code builds query strings for column names at runtime
- Use of `EXEC`, `sp_executesql`, or similar dynamic execution
- Pivot columns are not known at design time
- Query logic is hard to follow and test

**Recognition Example:**

```sql
-- Building column list dynamically
SELECT @cols = STRING_AGG(QUOTENAME(month), ',') FROM Sales;
-- Executing dynamic SQL
EXEC('SELECT ... PIVOT ... IN (' + @cols + ')');
```

## 4. Legitimate Uses of the Antipattern

Dynamic pivots are sometimes justified:

- Ad-hoc reporting tools where users select columns
- ETL processes where schema varies
- Administrative scripts for one-off data exploration

**Best Practice:**

- Limit dynamic pivots to trusted, internal use
- Always sanitize inputs
- Document why dynamic SQL is necessary

## 5. Solution: Using Code to Assist

Instead of relying on a single dynamic SQL query, use application code (in Python,
Java, etc.) to:

- Query distinct pivot values
- Build the SQL statement safely
- Execute the query and process results

**Python Example:**

```python
import sqlite3
conn = sqlite3.connect('sales.db')
cursor = conn.cursor()
# Get distinct months
cursor.execute('SELECT DISTINCT month FROM Sales')
months = [row[0] for row in cursor.fetchall()]
cols = ', '.join([f'SUM(CASE WHEN month = "{m}" THEN amount ELSE 0 END) AS [{m}]' for m in months])
query = f'SELECT salesperson, {cols} FROM Sales GROUP BY salesperson'
cursor.execute(query)
for row in cursor.fetchall():
    print(row)
```

**Advantages:**

- Safer: avoids SQL injection
- Easier to maintain and test
- Query plan can be cached if columns are static

**Best Practices:**

- Prefer static SQL when possible
- Use code to generate queries only when necessary
- Validate and sanitize all inputs

## 6. Mini-Antipattern: Operand Must Contain One Column

When using pivot or aggregation functions, ensure that the operand contains only one
column. Passing multiple columns or expressions can cause errors or unexpected
results.

**Antipattern Example:**

```sql
SELECT salesperson, SUM((month, amount)) FROM Sales GROUP BY salesperson;
-- Error: Operand must contain one column
```

**Solution Example:**

```sql
SELECT salesperson, SUM(amount) FROM Sales GROUP BY salesperson;
```

**Best Practices:**

- Always aggregate a single column
- Use explicit column names
- Avoid passing tuples or multiple columns to aggregate functions

---

## Performance Considerations

- Dynamic SQL prevents query plan caching, hurting performance
- Large numbers of pivot columns can slow down query execution
- Application-side pivots scale better for complex or variable schemas

## Summary of Best Practices

- Use static SQL for known pivot columns
- Use application code to generate queries when dynamic pivots are needed
- Sanitize all inputs to dynamic SQL
- Document and justify any use of dynamic pivots
- Aggregate only single columns

---

**For Developers and DBAs:**

- Avoid dynamic pivots unless absolutely necessary
- Prefer clarity, maintainability, and security over cleverness
- Test pivot queries with realistic data volumes
- Monitor query performance and optimize as needed
