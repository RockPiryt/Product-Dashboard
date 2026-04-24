const express = require("express");
const os = require("os");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

const DATA_DIR = "/data";
const DATA_FILE = path.join(DATA_DIR, "items.json");

app.use(express.json());

const defaultItems = [
  { id: 1, name: "Laptop Pro 14", category: "Electronics", price: 5999 },
  { id: 2, name: "Mechanical Keyboard", category: "Accessories", price: 499 },
  { id: 3, name: "Monitor 27", category: "Electronics", price: 1299 }
];

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultItems, null, 2));
  }
}

function readItems() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function writeItems(items) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(items, null, 2));
}

app.get("/items", (req, res) => {
  const items = readItems();

  res.json({
    items,
    count: items.length,
    servedBy: INSTANCE_ID
  });
});

app.post("/items", (req, res) => {
  const { name, category, price } = req.body;

  if (!name || !category || price === undefined || price === null) {
    return res.status(400).json({
      error: "Fields name, category and price are required"
    });
  }

  const numericPrice = Number(price);

  if (Number.isNaN(numericPrice) || numericPrice < 0) {
    return res.status(400).json({
      error: "Price must be a non-negative number"
    });
  }

  const items = readItems();

  const newItem = {
    id: items.length ? Math.max(...items.map(item => item.id)) + 1 : 1,
    name: String(name),
    category: String(category),
    price: numericPrice
  };

  items.push(newItem);
  writeItems(items);

  res.status(201).json({
    message: "Item created",
    item: newItem,
    servedBy: INSTANCE_ID
  });
});

app.get("/stats", (req, res) => {
  const items = readItems();

  res.json({
    totalProducts: items.length,
    instanceId: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}, instance ${INSTANCE_ID}`);
});