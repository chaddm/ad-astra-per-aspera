# Polling: Are We There Yet?: SQL Antipattern Guide

## Objective: Notify of Changes to Data

The objective is to detect when data changes in a database so that applications can
respond to those changes. This enables real-time features, workflow automation, and
keeping multiple systems synchronized. Efficient change detection is crucial for
modern applications, especially those requiring low-latency updates or integration
with external systems.[1][2]

---

## Antipattern: Polling for Changes

### What Is It?

"Polling" is an antipattern where applications repeatedly query the database at
regular intervals to check for changes, rather than being notified when changes
occur. This creates unnecessary load on the database, introduces latency, and results
in delayed detection of changes. Polling is often used for its simplicity, but it is
inefficient and does not scale well as the number of clients or frequency of polling
increases.[1][2]

### Why Developers Use Polling

- **Simplicity:** Polling is straightforward to implement with basic SQL queries,
  requiring no special database features or infrastructure.[1]
- **Database limitations:** Not all databases support change notification mechanisms
  (e.g., LISTEN/NOTIFY, CDC).[1]
- **Lack of awareness:** Developers may not know about alternative solutions or
  event-driven architectures.[1]
- **Framework defaults:** Some ORMs and application frameworks encourage polling
  patterns by default.
- **Cross-database compatibility:** Polling works everywhere, while notification
  features vary by vendor and version.[1][2]

---

## How to Recognize the Antipattern

### Symptoms

- Regular SELECT queries checking for new or modified records, often with timestamp
  or version comparisons.
- High database CPU and I/O usage from repetitive queries, especially under high
  load.[2]
- Delays between data changes and application response due to polling intervals.
- Database connections held open unnecessarily, reducing connection pool efficiency.
- Increased network traffic and contention as application scale grows.[2]

### Antipattern Example: Polling for New Orders

```python
# Continuous polling loop checking for new orders
import time
from datetime import datetime

last_check = datetime.now()
while True:
    new_orders = db.query("""
        SELECT * FROM orders
        WHERE created_at > %s
        AND status = 'pending'
    """, last_check)

    for order in new_orders:
        process_order(order)

    last_check = datetime.now()
    time.sleep(5)  # Poll every 5 seconds
```

- **Problems:** Wastes database resources, introduces up to 5 seconds of latency, and
  does not scale with multiple applications or high-frequency changes.[1][2]

---

## Performance Impact

Polling can have a significant negative effect on database performance:

- **Resource Waste:** Frequent polling increases CPU, I/O, and network usage, even
  when no data has changed.[2]
- **Scalability Issues:** As the number of polling clients grows, the database can
  become overwhelmed, leading to slowdowns for all users.[2]
- **Delayed Consistency:** Polling intervals introduce unavoidable delays between
  when data changes and when applications react.
- **Potential Lock Contention:** Repetitive queries may increase lock contention and
  reduce concurrency for other operations.

---

## Legitimate Uses of the Antipattern

There are cases where polling is justified:

- **External systems:** When monitoring third-party databases or APIs without
  notification capabilities.
- **Batch processing:** Scheduled jobs that process data at specific intervals where
  real-time response is not required.
- **Simple applications:** For low-traffic systems where polling overhead is
  negligible.
- **Cross-platform compatibility:** When supporting multiple database systems with
  different capabilities.
- **Long polling intervals:** When immediate response isn't critical (e.g., daily
  reports, infrequent sync tasks).[1]

---

## Solution: Just Wake Me Up When We Get There

### Event-Driven Approaches

#### PostgreSQL: LISTEN/NOTIFY

PostgreSQL provides a built-in pub-sub mechanism for change notifications.
LISTEN/NOTIFY allows applications to subscribe to a channel and receive notifications
when relevant changes occur. Notifications are delivered only after the transaction
commits, ensuring consistency and avoiding race conditions.[2]

```sql
-- Create a trigger to notify on changes
CREATE OR REPLACE FUNCTION notify_order_change()
RETURNS trigger AS $$
BEGIN
    PERFORM pg_notify('order_channel', NEW.id::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER order_notify_trigger
AFTER INSERT OR UPDATE ON orders
FOR EACH ROW
EXECUTE FUNCTION notify_order_change();
```

```python
# Application listens for notifications
import psycopg2
import select

conn = psycopg2.connect(database="mydb")
conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
cursor = conn.cursor()
cursor.execute("LISTEN order_channel;")

while True:
    if select.select([conn], [], [], 5) == ([], [], []):
        continue  # Timeout, no notification
    else:
        conn.poll()
        while conn.notifies:
            notify = conn.notifies.pop(0)
            print(f"New order: {notify.payload}")
            process_order(notify.payload)
```

#### SQL Server: Change Data Capture (CDC)

SQL Server provides Change Data Capture (CDC), which records row-level changes in a
change event stream by reading the transaction log. This enables applications and ETL
processes to consume changes efficiently and reliably.[3]

- CDC must be enabled on the database and specific tables.
- Changes are stored in change tables, which can be queried for new or modified rows.
- CDC is ideal for integration, replication, and event-driven architectures.

#### MySQL: Polling with Optimization

MySQL does not have a native notification mechanism, but polling can be optimized by
using indexed columns (e.g., last_modified) and incremental queries to reduce
overhead.[1]

```sql
-- Use a last_modified column with index
CREATE TABLE orders (
    id INT PRIMARY KEY,
    status VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_last_modified (last_modified)
);
```

```python
# Optimized polling with incremental timestamps
last_checked = get_last_processed_timestamp()
while True:
    new_orders = db.query("""
        SELECT * FROM orders
        WHERE last_modified > %s
        ORDER BY last_modified ASC
        LIMIT 100
    """, last_checked)

    if new_orders:
        for order in new_orders:
            process_order(order)
        last_checked = new_orders[-1].last_modified

    time.sleep(10)
```

### Alternative Solutions

| Solution                          | Description                                | Best For            |
| --------------------------------- | ------------------------------------------ | ------------------- |
| Database triggers + message queue | Trigger publishes to RabbitMQ, Kafka, etc. | Distributed systems |
| Change Data Capture (CDC)         | Debezium, Maxwell, AWS DMS                 | Event streaming     |
| Application-level events          | Publish events in application code         | Full control        |
| Database-specific features        | LISTEN/NOTIFY, SQL Server Service Broker   | Single database     |

---

## Mini-Antipattern: Enqueuing Before Committing

### What Is It?

Publishing change notifications or enqueuing tasks before the database transaction
commits can cause data inconsistencies and race conditions. This is a common pitfall
when integrating with message queues or event buses.[4]

```python
# WRONG: Notify before commit
def create_order(data):
    order = db.insert("INSERT INTO orders ...", data)
    message_queue.publish("new_order", order.id)  # Premature!
    db.commit()  # If this fails, message already sent
```

### Why It's Problematic

- **Race conditions:** Consumers may process notifications before data is committed.
- **Ghost notifications:** Failed transactions leave orphaned messages.
- **Data inconsistency:** Consumers see incomplete or rolled-back data.[4]

### Correct Approach

```python
# CORRECT: Notify after commit
def create_order(data):
    order = db.insert("INSERT INTO orders ...", data)
    db.commit()
    message_queue.publish("new_order", order.id)  # After commit
```

Or use the Transactional Outbox pattern for guaranteed delivery and atomicity between
database changes and notifications.[4]

---

## Best Practices

- **Use database notifications when available:** LISTEN/NOTIFY (PostgreSQL), Service
  Broker (SQL Server), triggers with external messaging.[2][3]
- **Index polling columns:** Always index timestamp or version columns used in
  polling queries.[1]
- **Implement exponential backoff:** Reduce polling frequency when no changes are
  detected to minimize load.
- **Use change data capture for event streaming:** Tools like Debezium or Maxwell can
  stream changes to Kafka or other systems.[5]
- **Consider message queues:** Decouple notification from database operations for
  better scalability and reliability.
- **Notify after commit:** Ensure data is persisted before publishing events to avoid
  inconsistencies.[4]
- **Batch processing when appropriate:** For non-time-sensitive operations, process
  changes in batches.
- **Monitor polling overhead:** Track query frequency and resource usage to avoid
  performance degradation.
- **Use connection pooling:** Don't hold connections open for polling loops; use
  connection pools for efficiency.

---

## Citations

1. [SQL Antipatterns: Avoiding the Pitfalls of Database Programming (Bill Karwin)](https://pragprog.com/titles/bksqla/sql-antipatterns/)
2. [PostgreSQL LISTEN/NOTIFY Documentation](https://www.postgresql.org/docs/current/sql-notify.html)
3. [Change Data Capture (CDC) in SQL Server](https://docs.microsoft.com/en-us/sql/relational-databases/track-changes/about-change-data-capture-sql-server)
4. [Transactional Outbox Pattern (microservices.io)](https://microservices.io/patterns/data/transactional-outbox.html)
5. [Debezium Documentation (CDC for distributed systems)](https://debezium.io/documentation/reference/stable/)
