const Database = require("better-sqlite3");

const db = new Database("ecommerce.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_email TEXT NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_amount INTEGER NOT NULL
  );
`);
db.prepare(`
    INSERT OR IGNORE INTO products (id, name, price, stock)
    VALUES (?, ?, ?, ?)
`).run(1, "Laptop", 500, 10);

module.exports = db;