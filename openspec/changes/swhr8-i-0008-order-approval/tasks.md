## 1. Data model

- [ ] 1.1 Define the per-order status record keyed by order id
- [ ] 1.2 Define the order status vocabulary and resolve the four-versus-five status conflict (SHIPPED_PART)
- [ ] 1.3 Define the order status listing with its status-record join
- [ ] 1.4 Support finding orders by status

## 2. Approval rules

- [ ] 2.1 Carry order total and locale in the order message
- [ ] 2.2 Implement automatic approval by locale and total (US < 500, JP < 50000)
- [ ] 2.3 Hold all other orders as PENDING and settle the zh_CN behaviour
- [ ] 2.4 Apply decisions only to PENDING orders
- [ ] 2.5 Validate incoming approval documents

## 3. Status operations

- [ ] 3.1 Create the status record on order receipt
- [ ] 3.2 Update and read status by order id with not-found error

## 4. Messaging

- [ ] 4.1 Implement the shared asynchronous send to one queue
- [ ] 4.2 Raise send failures to the caller
- [ ] 4.3 Perform the send within the caller's transaction
