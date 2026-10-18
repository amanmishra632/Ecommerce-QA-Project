const { defineConfig } = require("@playwright/test");
module.exports = defineConfig({
    workers: process.env.CI ? 1 : undefined,

    use: {
        baseURL: "http://127.0.0.1:3000"
    },

    webServer: {
        command: "node server.js",
        url: "http://127.0.0.1:3000",
        reuseExistingServer: !process.env.CI
    }
});