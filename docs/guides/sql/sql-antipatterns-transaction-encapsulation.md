# Transaction Encapsulation: SQL Antipattern Guide

## Objective: Transactions for Multiple Models

The objective is to ensure data consistency across multiple related database
operations. Transactions should encompass all changes that must succeed or fail
together, regardless of which application models or tables are involved. Proper
transaction management is critical for maintaining atomicity, consistency, isolation,
and durability (ACID) in database systems.[1][2][7]

---

## Antipattern: Every Model Class Manages Its Transactions

### What Is It?

"Transaction Encapsulation" is an antipattern where each model class or data access
object automatically wraps its database operations in transactions. This prevents
higher-level operations from grouping multiple model changes into a single atomic
transaction, leading to partial commits and data inconsistencies.[1][2][11]

### Why Developers Encapsulate Transactions

- **Convenience:** Auto-transactions seem to ensure data safety automatically,
  reducing perceived complexity.[1]
- **ORM defaults:** Many ORMs encourage per-model transaction management, sometimes
  even enabling autocommit by default.[1][5][6][10]
- **Separation of concerns:** Developers believe each model should manage its own
  persistence, misunderstanding transaction scope.[1]
- **Lack of understanding:** Misunderstanding of transaction boundaries and ACID
  properties leads to incorrect encapsulation.[1][2][9]
- **Copy-paste patterns:** Replicating code patterns without considering transaction
  boundaries or business requirements.

---

## How to Recognize the Antipattern

### Symptoms

- Each model's `save()` or `update()` method starts and commits its own transaction,
  often using autocommit mode.[1][5][8]
- Inability to roll back multiple related changes together, leading to partial
  updates.
- Data inconsistencies when operations partially succeed (e.g., order saved but not
  order items).
- Nested transaction errors or warnings (e.g., "cannot start a transaction within a
  transaction").[8]
- Complex workarounds to coordinate multiple model saves, such as manual compensation
  logic.[1][2]

### Antipattern Example: Auto-Committing Models

```python
# Each model auto-manages transactions
class Order:
    def save(self):
        db.begin_transaction()
        db.execute("INSERT INTO orders ...", self.data)
        db.commit()  # Commits immediately

class OrderItem:
    def save(self):
        db.begin_transaction()
        db.execute("INSERT INTO order_items ...", self.data)
        db.commit()  # Commits immediately

# Business logic cannot group these into one transaction
def create_order_with_items(order_data, items_data):
    order = Order(order_data)
    order.save()  # Commits here

    for item_data in items_data:
        item = OrderItem(item_data)
        item.save()  # Commits here

    # If an item save fails, order is already committed!
    # No way to roll back the whole operation
```

- **Problems:** Partial failures leave inconsistent data, no atomicity across models,
  difficult error handling.[1][2]

---

## Performance and Consistency Impact

- **Loss of Atomicity:** Related changes cannot be rolled back together, violating
  ACID principles.[1][2][7]
- **Increased Latency:** Multiple small transactions increase round-trips to the
  database, reducing efficiency.[2][7]
- **Complex Error Handling:** Developers must write manual compensation logic for
  partial failures.
- **Nested Transactions:** Most databases do not support true nested transactions;
  savepoints are needed for partial rollback, but are not a substitute for proper
  transaction boundaries.[5][8]
- **Inconsistent State:** System may be left in an inconsistent state if errors occur
  mid-operation.[1][4][7]
- **Isolation Issues:** Multiple small transactions can lead to read anomalies and
  isolation-level violations.[9]

---

## Legitimate Uses of the Antipattern

There are rare cases where per-model transactions are acceptable:

- **Single-model operations:** When truly operating on only one model with no
  dependencies.
- **Read-only operations:** Queries that don't modify data (no transaction
  needed).[8]
- **Idempotent operations:** Where partial failures can be safely retried without
  side effects.
- **Legacy systems:** When refactoring is impractical and risks are managed
  externally.[1]

---

## Solution: Simplify, Simplify

### Explicit Transaction Management

Manage transactions at the business logic or service layer, not inside model or
repository classes. Pass a transaction or connection object explicitly to model
methods, allowing the caller to define the transaction scope.[1][2][5][7][8]

```python
# Transaction managed at business logic level
class Order:
    def save(self, connection):
        # No transaction management, just execute
        connection.execute("INSERT INTO orders ...", self.data)

class OrderItem:
    def save(self, connection):
        # No transaction management, just execute
        connection.execute("INSERT INTO order_items ...", self.data)

# Business logic controls transaction scope
def create_order_with_items(order_data, items_data):
    with db.transaction() as txn:  # Single transaction
        order = Order(order_data)
        order.save(txn.connection)

        for item_data in items_data:
            item = OrderItem(item_data)
            item.save(txn.connection)

        txn.commit()  # All or nothing
```

### Unit of Work Pattern

The Unit of Work pattern tracks changes to multiple objects and coordinates the
writing out of changes in a single transaction, ensuring atomicity and
consistency.[2][10]

```python
# Unit of Work tracks changes and commits together
class UnitOfWork:
    def __init__(self):
        self.new_objects = []
        self.dirty_objects = []
        self.connection = None

    def register_new(self, obj):
        self.new_objects.append(obj)

    def register_dirty(self, obj):
        self.dirty_objects.append(obj)

    def commit(self):
        with db.transaction() as txn:
            self.connection = txn.connection
            for obj in self.new_objects:
                obj.insert(self.connection)
            for obj in self.dirty_objects:
                obj.update(self.connection)
            txn.commit()

# Usage
uow = UnitOfWork()
order = Order(order_data)
uow.register_new(order)

for item_data in items_data:
    item = OrderItem(item_data)
    uow.register_new(item)

uow.commit()  # One transaction for all changes
```

### Transaction Boundaries by Use Case

| Pattern               | Transaction Scope                   | Example                                   |
| --------------------- | ----------------------------------- | ----------------------------------------- |
| **Service-level**     | Entire business operation           | Create order with items, update inventory |
| **Repository-level**  | Single aggregate root with children | Save customer with addresses              |
| **Application-level** | Cross-service operations            | Distributed transactions (2PC, Saga)      |

- DDD recommends defining transaction boundaries around aggregate roots to enforce
  invariants and consistency.[4]

---

## Mini-Antipattern: ORMs that Pluralize Table Names

### What Is It?

ORMs that automatically pluralize table names (e.g., `Order` model → `orders` table)
using naive rules can cause mapping errors and confusion, especially with irregular
plurals or non-English words.[1]

```python
# ORM assumes pluralization
class Person:  # Maps to "persons" instead of "people"
    pass

class Child:  # Maps to "childs" instead of "children"
    pass
```

### Why It's Problematic

- **Irregular plurals:** English has many irregular plural forms.
- **Non-English words:** Pluralization rules don't apply to other languages.
- **Abbreviations and acronyms:** Unclear how to pluralize.
- **Existing schemas:** May not match your database naming conventions.
- **Maintenance confusion:** Developers must remember pluralization rules.[1]

### Solution

```python
# Explicitly specify table names
class Person:
    __tablename__ = 'people'

class Child:
    __tablename__ = 'children'

class FAQ:
    __tablename__ = 'faqs'
```

---

## Best Practices

- **Manage transactions at the business logic layer:** Not in model or repository
  classes.[1][2][5][7]
- **Use Unit of Work pattern:** For complex operations involving multiple
  models.[2][10]
- **Keep transactions short:** Only wrap operations that must be atomic.[5][7][8]
- **Avoid nested transactions:** Use savepoints explicitly if needed, but prefer flat
  transaction boundaries.[5][8]
- **Pass connections, not transactions:** Let callers control transaction
  scope.[1][5][10]
- **Explicitly specify table names:** Don't rely on ORM pluralization magic.[1]
- **Use framework transaction decorators:** `@transactional` for service
  methods.[5][6]
- **Test failure scenarios:** Ensure rollbacks work correctly.[7]
- **Document transaction boundaries:** Make it clear what operations are
  atomic.[1][4][7]
- **Choose appropriate isolation levels:** Understand and configure isolation levels
  based on consistency requirements.[9]
- **Use explicit transaction blocks:** Clearly demarcate transaction boundaries in
  code.[8]

---

## Citations

1. [SQL Antipatterns: Avoiding the Pitfalls of Database Programming (Bill Karwin)](https://pragprog.com/titles/bksqla/sql-antipatterns/)
2. [Patterns of Enterprise Application Architecture - Unit of Work (Martin Fowler)](https://martinfowler.com/eaaCatalog/unitOfWork.html)
3. [Transaction Script Pattern (Martin Fowler)](https://martinfowler.com/eaaCatalog/transactionScript.html)
4. [Domain-Driven Design: Aggregates and Transaction Boundaries (Vernon, DDD Community)](https://www.dddcommunity.org/library/vernon_2011/)
5. [Django Database Transactions](https://docs.djangoproject.com/en/stable/topics/db/transactions/)
6. [Rails Active Record Transactions](https://api.rubyonrails.org/classes/ActiveRecord/Transactions/ClassMethods.html)
7. [Microsoft: Transaction Design and Management Guidelines](https://learn.microsoft.com/en-us/azure/architecture/best-practices/data-management-transactions)
8. [PostgreSQL: Explicit Transaction Blocks](https://www.postgresql.org/docs/current/tutorial-transactions.html)
9. [Vlad Mihalcea: Transaction Isolation Levels](https://vladmihalcea.com/a-beginners-guide-to-transaction-isolation-levels/)
10. [SQLAlchemy ORM Session Basics](https://docs.sqlalchemy.org/en/20/orm/session_transaction.html)
11. [SQL Antipatterns Strike Back (Slides)](https://www.slideshare.net/billkarwin/sql-antipatterns-strike-back)
