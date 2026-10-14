class OrderPage {
    constructor(page) {
        this.page = page;
    }

    fillEmail(email) {
        return this.page.locator("#email").fill(email);
    }

    fillQuantity(quantity) {
        return this.page.locator("#quantity").fill(quantity.toString());
    }

    placeOrder() {
        return this.page.getByRole("button", { name: "Place Order" }).click();
    }
    getResult() {
        return this.page.locator("#result");
    }
}

module.exports = OrderPage;