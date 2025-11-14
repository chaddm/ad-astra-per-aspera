import sqlite3 from "sqlite3";

const DB_FILE = "key-value-store.sqlite";

function getDb() {
  const db = new sqlite3.Database(DB_FILE);
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS objects (
      key TEXT UNIQUE NOT NULL,
      value TEXT
    )`);
    db.run(`CREATE INDEX IF NOT EXISTS idx_key ON objects(key)`);
  });
  return db;
}

function store(key: string, value: string) {
  const db = getDb();
  db.run(
    `INSERT INTO objects (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [key, value],
    function (err: Error | null) {
      if (err) {
        console.error(`Error storing key: ${err.message}`);
      } else {
        console.log(`Key "${key}" stored successfully.`);
      }
      db.close();
    }
  );
}

// CLI argument parsing
const [,, cmd, ...args] = process.argv;

if (cmd === "store") {
  const [key, value] = args;
  if (!key || !value) {
    console.error("Usage: store <key> <value>");
    process.exit(1);
  }
  store(key, value);
} else {
  console.log("Database initialized.");
}
