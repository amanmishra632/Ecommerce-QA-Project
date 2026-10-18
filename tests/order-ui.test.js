const { test, expect } = require("@playwright/test");
const OrderPage = require("../pages/OrderPage");
const testData = {
    validEmail: "testui@example.com",
    validQuantity: 2,
    excessiveQuantity: 11
};
test.beforeEach(async ({ page }) => {
    const db = require("../database");

    db.prepare("DELETE FROM orders").run();

    db.prepare(`
        UPDATE products
        SET stock = 10
        WHERE id = 1
    `).run();

    await page.goto("/");
});

test("Customer can place an order through the UI", async ({ page }) => {

    

    const orderPage = new OrderPage(page);
    await orderPage.fillEmail(testData.validEmail);
    await orderPage.fillQuantity(testData.validQuantity);
    
    await orderPage.placeOrder();

    await expect(orderPage.getResult())
        .toHaveText("Order created successfully");
});
test("Customer cannot order more than available stock", async ({ page }) => {

   

    const orderPage = new OrderPage(page);

    await orderPage.fillEmail(testData.validEmail);
    await orderPage.fillQuantity(testData.excessiveQuantity);
    await orderPage.placeOrder();

    await expect(orderPage.getResult())
    .toHaveText("Requested quantity exceeds available stock");

});

   