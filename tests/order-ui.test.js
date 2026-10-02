const { test, expect } = require("@playwright/test");

test("Customer can place an order through the UI", async ({ page }) => {

    await page.goto("http://localhost:3000");

    await page.locator("#email").fill("testui@example.com");

    await page.locator("#quantity").fill("2");

    await page.locator("#orderButton").click();

    await expect(page.locator("#result"))
        .toHaveText("Order created successfully");
});