# E-commerce QA Automation Project

## Overview

This project demonstrates automated API and UI testing of a simple e-commerce application using Playwright.

The application supports product retrieval and order placement. The test suite verifies order validation, stock management, API responses, database integrity, and the customer purchase flow.

## Technologies Used

- JavaScript
- Node.js
- Express.js
- SQLite
- better-sqlite3
- Playwright
- Git and GitHub
- GitHub Actions

## Project Structure

```text
Ecommerce-QA-Project/
├── pages/
│   └── OrderPage.js
├── public/
│   └── index.html
├── tests/
│   ├── api.test.js
│   └── order-ui.test.js
├── database.js
├── server.js
├── playwright.config.js
├── package.json
└── README.md
```

## Testing Coverage

### 1. API Testing

- Verify product retrieval and response data.
- Verify successful order creation.
- Validate HTTP status codes and error messages.
- Reject orders for non-existent products.
- Validate invalid order quantities.

### 2. Business Logic and Boundary Testing

- Reject orders exceeding available stock.
- Verify purchases at the exact available-stock limit.
- Reject zero and negative quantities.
- Reject fractional quantities.
- Verify stock availability after previous orders.

### 3. Database Testing

- Verify that successful orders are stored correctly.
- Validate customer email, product ID, quantity, and total amount.
- Verify that rejected requests do not create unintended order records.
- Verify stock changes after successful orders.
- Verify stock remains unchanged after invalid fractional orders.

### 4. UI Testing

- Verify that a customer can place an order through the UI.
- Verify that an order exceeding available stock is rejected.
- Check that the expected success or error message is displayed.

## Automated Tests

The current Playwright test suite contains **13 tests**, covering:

1. Product API returns correct product data.
2. A customer cannot purchase more than the available stock.
3. A customer can purchase an available product.
4. A customer cannot purchase a product that does not exist.
5. A customer cannot place an order with quantity zero.
6. A customer can complete the end-to-end purchase flow.
7. A customer can purchase exactly the available stock.
8. Order quantity validation and stock limits.
9. Orders exceeding remaining stock are rejected.
10. Negative quantity `-1` is rejected.
11. Negative quantity `-5` is rejected.
12. Fractional quantities are rejected without changing stock or creating an order.
13. The UI rejects an order exceeding available stock and supports a successful purchase.

*Note: The exact test count and test names should be checked against the current test files whenever the suite changes.*

## Defect Investigation

### Defect: Fractional Order Quantities Accepted

**Observed behaviour:** The API originally accepted fractional quantities, such as `1.5` units.

**Expected behaviour:** Product quantities must be positive integers.

**Root cause:** The original server-side validation checked whether the quantity was less than or equal to zero but did not reject non-integer values.

**Fix:** The validation was updated to require a positive integer quantity.

**Regression test:** A Playwright API test verifies that a fractional quantity receives HTTP `400`, stock remains unchanged, and no order is created.

This demonstrates defect investigation, server-side validation, and regression testing.

## Running the Project Locally

### Prerequisites

- Node.js and npm
- Git

### Installation

Clone the repository and enter the project directory:

```bash
git clone https://github.com/amanmishra632/Ecommerce-QA-Project.git
cd Ecommerce-QA-Project
npm install
npx playwright install
```

### Run the Tests

```bash
npm test
```

The Playwright configuration starts the application through its `webServer` setting when an appropriate local server is not already running.

## CI/CD Integration

GitHub Actions is configured to automate the test workflow. The intended workflow includes:

1. Installing project dependencies.
2. Installing the required Playwright browser.
3. Starting the application.
4. Running the automated test suite.
5. Reporting test results.

Check the latest GitHub Actions run for the current CI status.

## Latest Local Test Results

| Metric | Result |
|---|---|
| Automated tests | 13 |
| Passed | 13 |
| Failed | 0 |
| Workers | 2 |
| Test framework | Playwright |

The full local suite passed twice in the recorded runs. These results describe those local executions and do not independently establish the latest CI result.

## Learning Outcomes

Through this project, I have practised:

- API testing with Playwright.
- UI automation and assertions.
- Positive, negative, and boundary-value testing.
- SQL database verification.
- Defect investigation and regression testing.
- Validating application state after successful and rejected requests.
- Running automated tests through a CI workflow.

## Future Improvements

- Improve test isolation and reliability when tests run in parallel.
- Expand UI validation and error-state coverage.
- Improve test reports and failure diagnostics.
- Strengthen test-data management and environment configuration.