const express = require("express");
const os = require("os");

const app = express();
const PORT = process.env.PORT || 3000;
const INSTANCE_ID = process.env.INSTANCE_ID || os.hostname();

app.use(express.json());

let items = [
  { id: 1, name: "Laptop Pro 14", category: "Electronics", price: 5999 },
  { id: 2, name: "Mechanical Keyboard", category: "Accessories", price: 499 },
  { id: 3, name: "Monitor 27", category: "Electronics", price: 1299 }
];

app.get("/items", (req, res) => {
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

  const newItem = {
    id: items.length ? items[items.length - 1].id + 1 : 1,
    name: String(name),
    category: String(category),
    price: numericPrice
  };

  items.push(newItem);

  res.status(201).json({
    message: "Item created",
    item: newItem,
    servedBy: INSTANCE_ID
  });
});

app.get("/stats", (req, res) => {
  res.json({
    totalProducts: items.length,
    instanceId: INSTANCE_ID,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}, instance ${INSTANCE_ID}`);
});