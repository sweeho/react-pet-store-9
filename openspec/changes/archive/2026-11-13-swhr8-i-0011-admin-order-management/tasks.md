## 1. Access control

- [x] 1.1 Restrict order administration to the administrator role with form login (SWHR8-T-0042; SWHR8-R-0019)
- [x] 1.2 Expire administrator sessions after 54 minutes of inactivity (SWHR8-T-0042; SWHR8-R-0162)
- [x] 1.3 Provide the administration launcher with manage-orders and logout actions (SWHR8-T-0042; SWHR8-R-0027)
- [x] 1.4 Reply with session-timeout and unknown-request-type errors (SWHR8-T-0042; SWHR8-R-0026)

## 2. Order listing

- [x] 2.1 Implement finding orders by exact status (SWHR8-T-0042; SWHR8-R-0004)
- [x] 2.2 Return per-order id, user id, date, value, status and total count for the four statuses (SWHR8-T-0042; SWHR8-R-0003, SWHR8-R-0144)
- [x] 2.3 Provide the order status view (SWHR8-T-0042; SWHR8-R-0028)

## 3. Approval workflow

- [x] 3.1 Allow pending orders to change only to APPROVED or DENIED (SWHR8-T-0042; SWHR8-R-0164)
- [x] 3.2 Publish decisions asynchronously and reply SUCCESS on hand-off (SWHR8-T-0042; SWHR8-R-0163)
- [x] 3.3 Define the Order Approval document structure (SWHR8-T-0042; SWHR8-R-0163)
- [x] 3.4 Validate incoming Order Approval documents against structure and document type (SWHR8-T-0042; SWHR8-R-0163, SWHR8-R-0166)
- [x] 3.5 Warn on Refresh when unsaved status changes exist (SWHR8-T-0042; SWHR8-R-0029)
- [x] 3.6 Forward update-status requests to order processing as one order-approval message (SWHR8-T-0042; SWHR8-R-0166)

## 4. Sales totals

- [x] 4.1 Provide revenue and quantity totals per category or item over a date range (SWHR8-T-0042; SWHR8-R-0165)
- [x] 4.2 Decide arithmetic precision for totals with the Business Owner (SWHR8-T-0042; SWHR8-R-0165)

## 5. Verification

- [x] 5.1 Write tests for each scenario in the delta spec (SWHR8-T-0042; SWHR8-R-0019, SWHR8-R-0162, SWHR8-R-0027, SWHR8-R-0026, SWHR8-R-0004, SWHR8-R-0003, SWHR8-R-0144, SWHR8-R-0164, SWHR8-R-0163, SWHR8-R-0165, SWHR8-R-0028, SWHR8-R-0029, SWHR8-R-0166)
