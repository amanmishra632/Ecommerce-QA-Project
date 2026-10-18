# E-commerce QA - Bug Reports

## BUG-001: Order accepted with zero quantity

### Title
System allowed an order with quantity 0.

### Steps to Reproduce
1. Send a POST request to `/orders`.
2. Use a valid product ID.
3. Set `quantity` to `0`.
4. Submit the request.

### Expected Result
The system should reject the order and return HTTP 400 with:

`Quantity must be greater than 0`

### Actual Result
The original application accepted the order and returned a successful order response.

### Severity
Medium

### Priority
High

### Status
Fixed and Retested

### Verification
After adding quantity validation, the automated Playwright test passed successfully.

## BUG-002: Orders accepted beyond available stock

### Title
System allowed multiple orders exceeding the total available stock.

### Steps to Reproduce
1. Ensure product ID `1` has an available stock of `10`.
2. Send a POST request to `/orders`.
3. Use a valid product ID and set `quantity` to `7`.
4. Submit the first request.
5. Submit the same request again with `quantity` set to `7`.
6. Observe both responses.

<!-- Comment: Each request asks for 7 units. Together, they request 14 units against an initial stock of 10. -->

### Expected Result
The first order should succeed, and the available stock should decrease from `10` to `3`.

The second order should be rejected with HTTP `400` and an appropriate insufficient-stock message.

<!-- Comment: This expected result assumes the application is intended to track and reduce inventory after purchases. -->

### Actual Result
The application accepted both orders and returned successful order responses.

A total of `14` units were ordered despite the initial available stock being `10`.

<!-- Comment: This behaviour was reproduced manually using Postman. -->
### Severity
High

### Priority
High

### Status
Fixed and Retested

### Verification
The issue was originally reproduced by submitting two consecutive POST requests to `/orders`, each requesting 7 units against an initial stock of 10.

The server now reduces stock and creates the order within a database transaction. The stock update checks that sufficient inventory remains before inserting the order.

Automated Playwright tests verify that successful orders reduce stock and that orders exceeding the remaining stock are rejected.

The test suite passed with 14 tests.