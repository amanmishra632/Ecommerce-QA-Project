const db = require("../database");
const { test, expect } = require("@playwright/test");
const Ajv = require("ajv");
const productSchema = require("../schemas/product.schema.json");

const ajv = new Ajv();
const validateProduct = ajv.compile(productSchema);

test.beforeEach(() => {
    db.prepare("DELETE FROM orders").run();

    db.prepare(`
        UPDATE products
        SET stock = 10
        WHERE id = 1
    `).run();
});
test("products API returns correct product data", async ({ request }) => {
    const response = await request.get("/products");

    // Verify HTTP status
    expect(response.status()).toBe(200);

    const data = await response.json();

    // Verify response structure
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);

    // Verify every product has the required fields and correct data types
    for (const product of data) {
    const isValid = validateProduct(product);

    expect(
        isValid,
        JSON.stringify(validateProduct.errors, null, 2)
    ).toBe(true);
    }

    // Verify the expected Laptop data by ID
    const laptop = data.find(product => product.id === 1);

    expect(laptop).toBeDefined();
    expect(laptop.name).toBe("Laptop");
    expect(laptop.price).toBe(500);
    expect(laptop.stock).toBe(10);
});


test("A customer cannot purchase more than the available stock", async ({ request }) => {
    const before = db.prepare(
    "SELECT COUNT(*) AS total FROM orders"
    ).get().total;
    const response = await request.post(
        "/orders",
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
    const product = db.prepare(
    "SELECT stock FROM products WHERE id = ?"
    ).get(1);

    expect(product.stock).toBe(10);
    const after= db.prepare(
    "SELECT COUNT(*) AS total FROM orders"
    ).get().total;
    expect(after).toBe(before);

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
        "/orders",
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
    const product = db.prepare(
    "SELECT stock FROM products WHERE id = ?"
    ).get(1);

    expect(product.stock).toBe(8);

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
        "/orders",
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
        "/orders",
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

    expect(data.message).toBe("Quantity must be a positive integer");
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
        "/products"
    );

    expect(productResponse.status()).toBe(200);

    const products = await productResponse.json();

    expect(products[0].id).toBe(1);
    expect(products[0].stock).toBeGreaterThanOrEqual(2);

    const orderResponse = await request.post(
        "/orders",
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
        "/orders",
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
test("System should reject orders that exceed the remaining stock", async ({ request }) => {
    // First order: request 7 laptops when stock is 10
    const firstResponse = await request.post("/orders", {
        data: {
            customer_email: "first@test.com",
            product_id: 1,
            quantity: 7
        }
    });
    expect(firstResponse.status()).toBe(201);

    // Second order: only 3 laptops should remain
    const secondResponse = await request.post("/orders", {
        data: {
            customer_email: "second@test.com",
            product_id: 1,
            quantity: 7
        }
    });

    // The second order should be rejected
    expect(secondResponse.status()).toBe(400);
});

for (const quantity of [-1, -5]) {
    test(`Order should reject quantity ${quantity}`, async ({ request }) => {
        const response = await request.post("/orders", {
            data: {
                customer_email: "negative@test.com",
                product_id: 1,
                quantity
            }
        });

        expect(response.status()).toBe(400);

        const data = await response.json();
        expect(data.message).toBe("Quantity must be a positive integer");

        const order = db.prepare(`
            SELECT * FROM orders
            WHERE customer_email = ?
              AND product_id = ?
              AND quantity = ?
        `).get("negative@test.com", 1, quantity);

        expect(order).toBeUndefined();
    });
}
test("API rejects fractional quantities without changing stock or creating an order", async ({ request }) => {
    const response = await request.post("/orders", {
        data: {
            customer_email: "fractional@test.com",
            product_id: 1,
            quantity: 1.5
        }
    });

    expect(response.status()).toBe(400);

    const data = await response.json();
    expect(data.message).toBe("Quantity must be a positive integer");

    const product = db.prepare(
        "SELECT stock FROM products WHERE id = ?"
    ).get(1);

    expect(product.stock).toBe(10);

    const order = db.prepare(`
        SELECT * FROM orders
        WHERE customer_email = ?
    `).get("fractional@test.com");

    expect(order).toBeUndefined();
});
test("Product schema rejects a price with the wrong data type", async () => {
    const invalidProduct = {
        id: 1,
        name: "Laptop",
        price: "500",
        stock: 10
    };

    const isValid = validateProduct(invalidProduct);

    expect(isValid).toBe(false);
});