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