## 1. Data model

- [ ] 1.1 Define the per-order status record keyed by order id
- [ ] 1.2 Define the order status vocabulary and resolve the four-versus-five status conflict
- [ ] 1.3 Define the order status listing view with its status-record join
- [ ] 1.4 Support looking up orders by status

## 2. Approval rules

- [ ] 2.1 Implement automatic approval by locale and total
- [ ] 2.2 Hold all other orders as PENDING and settle the zh_CN behaviour
- [ ] 2.3 Apply decisions only to PENDING orders
- [ ] 2.4 Implement the administrator hold and decision flow

## 3. Workflow and messaging

- [ ] 3.1 Send the supplier purchase order when an order is approved
- [ ] 3.2 Notify customer relations of changed orders
- [ ] 3.3 Implement the shared asynchronous send with transactional and failure semantics
- [ ] 3.4 Decide whether pluggable transition delegates are retained

## 4. Message documents

- [ ] 4.1 Define the OrderApproval document and its validation
- [ ] 4.2 Define the Mail document
- [ ] 4.3 Validate incoming documents against their schema
- [ ] 4.4 Make order and approval mail notifications off by default
