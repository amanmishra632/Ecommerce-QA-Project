const db = require("../database");
const { test, expect } = require("@playwright/test");

test.beforeEach(() => {
    db.prepare("DELETE FROM orders").run();
});

test("products API returns correct product data", async ({ request }) => {
    const response = await request.get(
        "http://localhost:3000/products"
    );

    expect(response.status()).toBe(200);

    const data = await response.json();

    expect(data[0].name).toBe("Laptop");
    expect(data[0].price).toBe(500);
    expect(data[0].stock).toBe(10);
});


test("A customer cannot purchase more than the available stock", async ({ request }) => {
    const response = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 1,
                quantity: 11
            }
        }
    );

    expect(response.status()).toBe(400);

    const data = await response.json();

    expect(data.message).toBe(
        "Requested quantity exceeds available stock"
    );

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE customer_email = ?
          AND product_id = ?
          AND quantity = ?
    `).get("customer@test.com", 1, 11);

    expect(order).toBeUndefined();
});


test("A customer can purchase an available product", async ({ request }) => {
    const response = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 1,
                quantity: 2
            }
        }
    );

    expect(response.status()).toBe(201);

    const data = await response.json();

    expect(data.message).toBe(
        "Order created successfully"
    );

    expect(data.total_amount).toBe(1000);

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE id = ?
    `).get(data.order_id);

    expect(order).toBeDefined();
    expect(order.customer_email).toBe("customer@test.com");
    expect(order.product_id).toBe(1);
    expect(order.quantity).toBe(2);
    expect(order.total_amount).toBe(1000);
});


test("A customer cannot purchase a product that does not exist", async ({ request }) => {
    const response = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 999,
                quantity: 2
            }
        }
    );

    expect(response.status()).toBe(404);

    const data = await response.json();

    expect(data.message).toBe(
        "Product not found"
    );

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE customer_email = ?
          AND product_id = ?
          AND quantity = ?
    `).get("customer@test.com", 999, 2);

    expect(order).toBeUndefined();
});


test("A customer cannot place an order with quantity 0", async ({ request }) => {
    const response = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 1,
                quantity: 0
            }
        }
    );

    expect(response.status()).toBe(400);

    const data = await response.json();

    expect(data.message).toBe(
        "Quantity must be greater than 0"
    );

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE customer_email = ?
          AND product_id = ?
          AND quantity = ?
    `).get("customer@test.com", 1, 0);

    expect(order).toBeUndefined();
});


test("Customer can purchase an available product end to end", async ({ request }) => {

    const productResponse = await request.get(
        "http://localhost:3000/products"
    );

    expect(productResponse.status()).toBe(200);

    const products = await productResponse.json();

    expect(products[0].id).toBe(1);
    expect(products[0].stock).toBeGreaterThanOrEqual(2);

    const orderResponse = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 1,
                quantity: 2
            }
        }
    );

    expect(orderResponse.status()).toBe(201);

    const orderData = await orderResponse.json();

    expect(orderData.total_amount).toBe(1000);

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE id = ?
    `).get(orderData.order_id);

    expect(order).toBeDefined();
    expect(order.customer_email).toBe("customer@test.com");
    expect(order.product_id).toBe(1);
    expect(order.quantity).toBe(2);
    expect(order.total_amount).toBe(1000);
});
test("A customer can purchase a product only when the requested quantity is greater than 0 and does not exceed the available stock.", async ({ request }) => {
    const response = await request.post(
        "http://localhost:3000/orders",
        {
            data: {
                customer_email: "customer@test.com",
                product_id: 1,
                quantity: 10
            }
        }
    );

    expect(response.status()).toBe(201);

    const data = await response.json();

    expect(data.message).toBe(
        "Order created successfully"
    );
    expect(data.total_amount).toBe(5000);


    const order = db.prepare(`
        SELECT * FROM orders
        WHERE customer_email = ?
          AND product_id = ?
          AND quantity = ?
    `).get("customer@test.com", 1, 10);

    expect(order).toBeDefined();
});
