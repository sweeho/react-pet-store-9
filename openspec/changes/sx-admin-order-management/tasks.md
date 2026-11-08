## 1. Access control

- [ ] 1.1 Restrict order administration to the administrator role with form login
- [ ] 1.2 Expire administrator sessions after 54 minutes of inactivity
- [ ] 1.3 Provide the administration launcher with manage-orders and logout actions
- [ ] 1.4 Reply with session-timeout and unknown-request-type errors

## 2. Order listing

- [ ] 2.1 Implement finding orders by exact status
- [ ] 2.2 Return per-order id, user id, date, value, status and total count for the four statuses
- [ ] 2.3 Provide the order status view

## 3. Approval workflow

- [ ] 3.1 Allow pending orders to change only to APPROVED or DENIED
- [ ] 3.2 Publish decisions asynchronously and reply SUCCESS on hand-off
- [ ] 3.3 Define the Order Approval document structure
- [ ] 3.4 Validate incoming Order Approval documents against structure and document type

## 4. Sales totals

- [ ] 4.1 Provide revenue and quantity totals per category or item over a date range
- [ ] 4.2 Decide arithmetic precision for totals with the Business Owner

## 5. Verification

- [ ] 5.1 Write tests for each scenario in the delta spec
