const express = require("express");
const db = require("./database");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/products", (req, res) => {
    const products = db.prepare("SELECT * FROM products").all();
    res.json(products);
});
app.post("/orders", (req, res) => {
    const { customer_email, product_id, quantity } = req.body;

    const product = db.prepare(
        "SELECT * FROM products WHERE id = ?"
    ).get(product_id);

    if (!product) {
        return res.status(404).json({
            message: "Product not found"
        });
    }
    if (quantity <= 0) {
    return res.status(400).json({
        message: "Quantity must be greater than 0"
    });
    }

    if (quantity > product.stock) {
        return res.status(400).json({
            message: "Requested quantity exceeds available stock"
        });
    }

    const total_amount = product.price * quantity;

    const result = db.prepare(`
        INSERT INTO orders
        (customer_email, product_id, quantity, total_amount)
        VALUES (?, ?, ?, ?)
    `).run(customer_email, product_id, quantity, total_amount);

    res.status(201).json({
        message: "Order created successfully",
        order_id: result.lastInsertRowid,
        product_id,
        quantity,
        total_amount
    });
});

app.listen(3000, () => {
    console.log("E-commerce server running on http://localhost:3000");
});