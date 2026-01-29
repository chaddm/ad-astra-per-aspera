# SQL Language Antipatterns

## Outline

- SQL Language Antipatterns
  - Fear of JOINs
    - Objective: Combining Matching Data in Two Tables
    - Antipattern: Fearing JOINs
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Preferring JOINs
    - Mini-Antipattern: Comma-Style Join Syntax
    - Mini-Antipattern: NATURAL JOIN
  - Relational Division
    - Objective: Matching a List of Values
    - Antipattern: Searching Multiple Rows in a WHERE Clause
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Using Relational Division
    - Mini-Antipattern: Aggregation Functions in the WHERE Clause
  - Dynamic Pivot
    - Objective: Turning the Table
    - Antipattern: Using a Single Query
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Using Code to Assist
    - Mini-Antipattern: Operand Must Contain One Column
  - Pagination: Take It from the Top
    - Objective: Presenting Query Results in Pages
    - Antipattern: Mistaking Offset for Optimization
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Changing the Rules
    - Mini-Antipattern: LIMIT without ORDER BY
- Optimization Antipatterns
  - Non-Sargable Queries
    - Objective: Optimizing Complex Queries
    - Antipattern: Using Queries That Can’t Be Optimized
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Refactoring the Query
    - Mini-Antipattern: Redundant Indexes
  - Premature Denormalization
    - Objective: Breaking the Rules to Improve Performance
    - Antipattern: Breaking the Rules Recklessly
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Breaking the Rules Carefully
    - Mini-Antipattern: Query Snipers
  - NoSQL: The Grass Is Always Greener on the Other Side
    - Objective: Relief from the Challenges of SQL
    - Antipattern: Switching to NoSQL Is Easy
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Match Your Queries to Your NoSQL Models
    - Mini-Antipattern: N+1 Queries
  - JSON: Matryoshka Dolls
    - Objective: Unlimited Flexibility
    - Antipattern: Semi-Structured Data in a Relational Database
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Be Mindful and Moderate About Flexibility
    - Mini-Antipattern: Quotes for All Occasions
  - Cacheless Transactions
    - Objective: A Magic Trick to Improve Performance
    - Antipattern: The Performance Vanishing Act
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Use Sleight of Hand
    - Mini-Antipattern: Query Caching
  - Application Design Antipatterns
    - Polling: Are We There Yet?
    - Objective: Notify of Changes to Data
    - Antipattern: Polling for Changes
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Just Wake Me Up When We Get There
    - Mini-Antipattern: Enqueuing Before Committing
  - Transaction Encapsulation
    - Objective: Transactions for Multiple Models
    - Antipattern: Every Model Class Manages Its Transactions
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Simplify, Simplify
    - Mini-Antipattern: ORMs that Pluralize Table Names
  - Fear of Deadlocks
    - Objective: Don’t See Deadlock Errors
    - Antipattern: Trying to Prevent All Deadlocks
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: Mitigate Deadlocks
    - Mini-Antipattern: Sharing Connections Between Threads
  - Data Hoarding
    - Objective: Cope with Data Bloat
    - Antipattern: The Belief That You Need All Data
    - How to Recognize the Antipattern
    - Legitimate Uses of the Antipattern
    - Solution: An Intervention to Manage Data Retention

## SQL Language Antipatterns

---

## Summary of Created Documentation

This directory contains comprehensive guides for SQL antipatterns, covering both SQL
Language Antipatterns and Optimization Antipatterns. Each antipattern is documented
in detail with explanations, code examples, and best practices.

### Documents Created

#### SQL Language Antipatterns

1. **sql-antipatterns-fear-of-joins.md** - Covers why developers avoid JOINs, how to
   recognize the antipattern, proper JOIN usage, and warnings about comma-style joins
   and NATURAL JOIN.

2. **sql-antipatterns-relational-division.md** - Explains how to match all values in
   a list, the pitfalls of using IN/OR incorrectly, and proper GROUP BY/HAVING
   solutions.

3. **sql-antipatterns-dynamic-pivot.md** - Details the problems with dynamic SQL
   pivots and how to use application code safely to assist with pivoting.

4. **sql-antipatterns-pagination.md** - Covers OFFSET/LIMIT antipatterns and
   introduces keyset/cursor-based pagination as better alternatives.

#### Optimization Antipatterns

5. **sql-antipatterns-non-sargable-queries.md** - Explains SARGABLE predicates, how
   functions and type conversions prevent index usage, and how to refactor queries
   for better performance.

6. **sql-antipatterns-premature-denormalization.md** - Discusses when denormalization
   is premature vs. justified, data consistency issues, and the "Query Snipers"
   mini-antipattern.

7. **sql-antipatterns-nosql.md** - Covers the misconception that switching to NoSQL
   is easy, when NoSQL is appropriate, and the N+1 query problem in NoSQL contexts.

8. **sql-antipatterns-json.md** - Explains the risks of storing semi-structured data
   in relational databases, when JSON columns are appropriate, and the "Quotes for
   All Occasions" mini-antipattern.

9. **sql-antipatterns-cacheless-transactions.md** - Details caching strategies with
   transactional databases, cache invalidation, and the query caching
   mini-antipattern.

### What Each Document Contains

- **Clear explanations** for each section
- **Code examples** showing both antipatterns and proper solutions
- **Performance considerations** and optimization tips
- **Best practices** and actionable recommendations
- **Common pitfalls** to avoid
- **References** to authoritative sources

### Document Structure

Each antipattern document follows a consistent structure:

1. **Objective** - What goal are developers trying to achieve?
2. **Antipattern** - What is the problematic approach?
3. **How to Recognize the Antipattern** - Warning signs in code
4. **Legitimate Uses of the Antipattern** - When the approach might be justified
5. **Solution** - The recommended best practice approach
6. **Mini-Antipattern** - Related smaller antipatterns to avoid

### Coverage

All documents are properly formatted with:

- Markdown headings
- Code blocks with syntax highlighting
- Practical SQL examples for PostgreSQL, MySQL, SQL Server, and other databases where
  applicable
- Tables and lists for easy reference
- Citations and further reading recommendations

### Related Resources

- Individual antipattern guides: `docs/guides/sql-antipatterns-*.md`

---
