const express = require("express");
const os = require("os");
const { Pool } = require("pg");
const { createClient } = require("redis");

const app = express();

const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

const CACHE_KEY = "items:list";
let cacheHits = 0;

app.use(express.json());

const pool = new Pool({
  host: process.env.PGHOST || "db",
  port: Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD
});

const redis = createClient({
  url: process.env.REDIS_URL || "redis://cache:6379"
});

redis.on("error", err => {
  console.error("Redis error:", err);
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      price NUMERIC(10,2) NOT NULL DEFAULT 0
    );
  `);
}

async function getItemsFromDb() {
  const result = await pool.query(`
    SELECT id, name, price::float AS price
    FROM products
    ORDER BY id ASC
  `);

  return result.rows;
}

app.get("/items", async (req, res) => {
  try {
    const cached = await redis.get(CACHE_KEY);

    if (cached) {
      cacheHits += 1;

      const items = JSON.parse(cached);

      return res.json({
        items,
        count: items.length,
        servedBy: INSTANCE_ID,
        cache: "hit"
      });
    }

    const items = await getItemsFromDb();

    await redis.setEx(CACHE_KEY, 30, JSON.stringify(items));

    res.json({
      items,
      count: items.length,
      servedBy: INSTANCE_ID,
      cache: "miss"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get items" });
  }
});

app.post("/items", async (req, res) => {
  try {
    const { name, price } = req.body;

    if (!name || price === undefined || price === null) {
      return res.status(400).json({
        error: "Fields name and price are required"
      });
    }

    const numericPrice = Number(price);

    if (Number.isNaN(numericPrice) || numericPrice < 0) {
      return res.status(400).json({
        error: "Price must be a non-negative number"
      });
    }

    const result = await pool.query(
      `
      INSERT INTO products (name, price)
      VALUES ($1, $2)
      RETURNING id, name, price::float AS price
      `,
      [String(name), numericPrice]
    );

    await redis.del(CACHE_KEY);

    res.status(201).json({
      message: "Item created",
      item: result.rows[0],
      servedBy: INSTANCE_ID
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create item" });
  }
});

app.get("/stats", async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*)::int AS count FROM products");

    res.json({
      totalProducts: result.rows[0].count,
      cache_hits: cacheHits,
      instanceId: INSTANCE_ID,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get stats" });
  }
});

app.get("/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    await redis.ping();

    res.json({ status: "ok" });
  } catch {
    res.status(503).json({ status: "error" });
  }
});

async function start() {
  await redis.connect();
  await initDb();

  app.listen(PORT, () => {
    console.log(`Backend listening on port ${PORT}, instance ${INSTANCE_ID}`);
  });
}

start().catch(err => {
  console.error("Startup failed:", err);
  process.exit(1);
});