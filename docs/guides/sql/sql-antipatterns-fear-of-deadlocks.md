# Fear of Deadlocks: SQL Antipattern Guide

## Objective: Don't See Deadlock Errors

The objective is to prevent deadlock errors from occurring in database applications.
Deadlocks happen when two or more transactions wait for each other to release locks,
creating a circular dependency that the database must break [9].

---

## Antipattern: Trying to Prevent All Deadlocks

### What Is It?

"Fear of Deadlocks" is an antipattern where developers attempt to completely
eliminate deadlocks through overly complex locking strategies, serialization, or
avoiding concurrent operations altogether [1]. This often results in poor performance
and scalability issues.

### Why Developers Fear Deadlocks

- **Error messages are scary:** Deadlock errors seem like critical failures.
- **Perceived data corruption risk:** Misunderstanding that deadlocks don't corrupt
  data [2][3][4].
- **Production anxiety:** Fear of customer-facing errors.
- **Lack of understanding:** Not knowing how databases handle deadlocks automatically
  [2][3][4].
- **Over-engineering:** Attempting to prevent all possible failure modes [1].

---

## How to Recognize the Antipattern

### Symptoms

- Application-level global locks or mutexes before database operations.
- Serializing all database writes through a single queue.
- Using `SELECT ... FOR UPDATE` excessively "just in case" [6][7][8].
- Reducing isolation levels unnecessarily to avoid locking [11].
- Complex custom deadlock prevention logic [1].
- Extremely low transaction concurrency.

### Antipattern Example: Over-Locking

```python
# Global application lock to "prevent" deadlocks
import threading

global_db_lock = threading.Lock()

def transfer_money(from_account, to_account, amount):
    with global_db_lock:  # Only one transaction at a time!
        with db.transaction() as txn:
            # Withdraw from source
            txn.execute("""
                UPDATE accounts
                SET balance = balance - %s
                WHERE id = %s
            """, (amount, from_account))

            # Deposit to destination
            txn.execute("""
                UPDATE accounts
                SET balance = balance + %s
                WHERE id = %s
            """, (amount, to_account))

            txn.commit()

# Result: Only one transfer can happen at a time across entire application!
```

- **Problems:** Terrible performance, no concurrency, defeats purpose of database
  transactions [1].

### Antipattern Example: Excessive Serialization

```python
# Forcing serializable isolation for all transactions
db.set_default_isolation_level('SERIALIZABLE')

# Or using SELECT FOR UPDATE everywhere
def get_account(account_id):
    return db.query("""
        SELECT * FROM accounts
        WHERE id = %s
        FOR UPDATE  -- Locks even for reads!
    """, account_id)
```

- **Problems:** Reduced concurrency, increased lock contention, longer transaction
  times [6][7][8][11].

---

## Legitimate Uses of the Antipattern

There are rare cases where extreme deadlock prevention is justified:

- **Real-time systems:** Where transaction retry is unacceptable.
- **Legacy databases:** With poor deadlock detection or handling.
- **Critical one-time operations:** Where failure would be catastrophic.
- **Known hotspot resources:** Serializing access to specific high-contention rows
  [9].

---

## Solution: Mitigate Deadlocks

### Accept and Retry

```python
# Proper deadlock handling with retry
import time
from psycopg2.extensions import TransactionRollbackError

def transfer_money_with_retry(from_account, to_account, amount, max_retries=3):
    for attempt in range(max_retries):
        try:
            with db.transaction() as txn:
                # Access accounts in consistent order (by ID)
                accounts = sorted([from_account, to_account])

                txn.execute("""
                    UPDATE accounts
                    SET balance = balance - %s
                    WHERE id = %s
                """, (amount, from_account))

                txn.execute("""
                    UPDATE accounts
                    SET balance = balance + %s
                    WHERE id = %s
                """, (amount, to_account))

                txn.commit()
                return True

        except TransactionRollbackError as e:
            if 'deadlock detected' in str(e) and attempt < max_retries - 1:
                # Exponential backoff [10]
                time.sleep(0.1 * (2 ** attempt))
                continue
            raise

    return False
```

### Consistent Lock Ordering

```sql
-- Always lock accounts in consistent order (e.g., by ID) [1][5]
-- Transaction 1:
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;  -- Lock account 1 first
UPDATE accounts SET balance = balance + 100 WHERE id = 5;  -- Then account 5
COMMIT;

-- Transaction 2:
BEGIN;
UPDATE accounts SET balance = balance - 50 WHERE id = 1;   -- Also locks account 1 first
UPDATE accounts SET balance = balance + 50 WHERE id = 3;   -- Then account 3
COMMIT;
-- No circular dependency, no deadlock
```

### Keep Transactions Short

```python
# BAD: Long-running transaction
def process_order(order_id):
    with db.transaction() as txn:
        order = txn.query("SELECT * FROM orders WHERE id = %s FOR UPDATE", order_id)

        # External API call while holding locks! [5]
        payment_result = payment_api.charge(order.total)

        txn.execute("UPDATE orders SET status = 'paid' WHERE id = %s", order_id)
        txn.commit()

# GOOD: Minimize transaction time [5]
def process_order(order_id):
    order = db.query("SELECT * FROM orders WHERE id = %s", order_id)

    # External operations outside transaction
    payment_result = payment_api.charge(order.total)

    # Quick transaction to update status
    with db.transaction() as txn:
        txn.execute("UPDATE orders SET status = 'paid' WHERE id = %s", order_id)
        txn.commit()
```

### Deadlock Mitigation Strategies

| Strategy                            | Description                                         | When to Use              |
| ----------------------------------- | --------------------------------------------------- | ------------------------ |
| **Retry with backoff** [10]         | Catch deadlock errors, retry with exponential delay | Most common case         |
| **Consistent lock ordering** [1][5] | Always acquire locks in same order (e.g., by ID)    | Known lock patterns      |
| **Reduce transaction time** [5]     | Keep transactions as short as possible              | Long-running operations  |
| **Optimize indexes**                | Reduce lock escalation and contention               | High-volume updates      |
| **Partition data**                  | Reduce lock contention on hot tables                | High-concurrency systems |
| **Lock timeout** [2][3][4]          | Set reasonable timeout to fail fast                 | Responsive applications  |

---

## Mini-Antipattern: Sharing Connections Between Threads

### What Is It?

Using the same database connection across multiple threads:

```python
# WRONG: Shared connection across threads
import threading

conn = db.connect()  # Single connection

def worker_thread(task_id):
    # Multiple threads using same connection!
    conn.execute("UPDATE tasks SET status = 'done' WHERE id = %s", task_id)

threads = [threading.Thread(target=worker_thread, args=(i,)) for i in range(10)]
for t in threads:
    t.start()
```

### Why It's Problematic

- **Race conditions:** Concurrent operations on same connection.
- **Transaction isolation violations:** Threads interfere with each other's
  transactions [11].
- **Connection state corruption:** Unpredictable behavior.
- **Deadlocks:** Increased likelihood due to lock confusion [9].
- **Database errors:** Most database drivers are not thread-safe.

### Solution

```python
# CORRECT: Connection pooling, one connection per thread
from contextlib import contextmanager

@contextmanager
def get_connection():
    conn = db_pool.get_connection()
    try:
        yield conn
    finally:
        db_pool.return_connection(conn)

def worker_thread(task_id):
    with get_connection() as conn:  # Each thread gets own connection
        conn.execute("UPDATE tasks SET status = 'done' WHERE id = %s", task_id)
```

---

## Best Practices

- **Accept that deadlocks happen:** They are a normal part of concurrent database
  systems [5].
- **Implement retry logic:** Catch deadlock exceptions and retry with exponential
  backoff [10].
- **Use consistent lock ordering:** Access resources in a predictable order (e.g., by
  ID) [1][5].
- **Keep transactions short:** Minimize time holding locks [5].
- **Use appropriate isolation levels:** Don't default to SERIALIZABLE unless
  necessary [11].
- **Monitor deadlock frequency:** Log and track, but don't panic over occasional
  deadlocks [2][3][4].
- **Optimize indexes:** Reduce lock escalation and table scans.
- **Use connection pooling:** Never share connections across threads.
- **Set reasonable timeouts:** Fail fast rather than waiting indefinitely [2][3][4].
- **Profile lock contention:** Use database monitoring tools to identify hotspots
  [9].

---

## Citations

1. [SQL Antipatterns: Avoiding the Pitfalls of Database Programming (Bill Karwin)](https://pragprog.com/titles/bksqla/sql-antipatterns/)
2. [PostgreSQL: Deadlocks](https://www.postgresql.org/docs/current/deadlock.html)
3. [MySQL: InnoDB Deadlocks](https://dev.mysql.com/doc/refman/8.0/en/innodb-deadlocks.html)
4. [SQL Server: Handling Deadlocks](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server/handling-deadlocks)
5. [Martin Kleppmann: Don't Fear the Deadlock](https://martin.kleppmann.com/2017/02/28/dont-fear-the-deadlock.html)
6. [PostgreSQL: Explicit Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
7. [MySQL: InnoDB Locking](https://dev.mysql.com/doc/refman/8.0/en/innodb-locking.html)
8. [SQL Server: Locking in SQL Server](https://learn.microsoft.com/en-us/sql/relational-databases/sql-server/locking-in-sql-server)
9. [Understanding Database Deadlocks (Brent Ozar)](https://www.brentozar.com/archive/2013/08/what-is-a-deadlock/)
10. [Exponential Backoff for Retries](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)
11. [Transaction Isolation Levels Explained](https://www.postgresql.org/docs/current/transaction-iso.html)
