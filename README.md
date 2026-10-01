# E-commerce QA Automation Project

## Overview

This project demonstrates API and database testing of a simple e-commerce application using Playwright.

## Technologies

- Node.js
- Express.js
- SQLite
- Playwright
- JavaScript
- Git & GitHub
- GitHub Actions

## What I Tested

- Product API
- Successful product purchase
- Purchase quantity validation
- Stock limit validation
- Non-existent product validation
- API response status and messages
- Database order records
- End-to-end purchase flow
- Boundary conditions

## Automated Tests

The project contains automated tests covering:

1. Product API returns correct product data
2. Customer cannot purchase more than available stock
3. Customer can purchase an available product
4. Customer cannot purchase a product that does not exist
5. Customer cannot place an order with quantity 0
6. Customer can purchase an available product end to end
7. Customer can purchase exactly the available stock

## Database Validation

The tests verify that:

- Successful orders are stored correctly.
- Failed orders do not create unwanted database records.
- Customer, product, quantity and total amount are stored correctly.

## Defect Found

During boundary testing, the application originally allowed an order with quantity `0`.

The defect was fixed by adding server-side quantity validation, and the automated test was then used to verify the fix.

## CI/CD

GitHub Actions automatically:

1. Installs dependencies
2. Installs Playwright browsers
3. Starts the application
4. Runs the automated test suite

## Test Result

All current automated tests pass successfully in CI.