import { Database } from "bun:sqlite";
const db = new Database("key-value-store-test.sqlite");
try {
  db.exec("SELECT load_extension(\"./lib/vec0.dylib\")");
  console.log("Extension loaded successfully");
} catch (e) {
  console.error("Failed to load extension:", e);
}
