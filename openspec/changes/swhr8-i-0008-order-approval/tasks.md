## 1. Data model

- [ ] 1.1 Define the per-order status record keyed by order id (SWHR8-T-0030; SWHR8-R-0149)
- [ ] 1.2 Define the order status vocabulary and resolve the four-versus-five status conflict (SHIPPED_PART) (SWHR8-T-0030; SWHR8-R-0148, SWHR8-R-0083)
- [ ] 1.3 Define the order status listing with its status-record join (SWHR8-T-0030; SWHR8-R-0008)
- [ ] 1.4 Support finding orders by status (SWHR8-T-0030; SWHR8-R-0082)

## 2. Approval rules

- [ ] 2.1 Carry order total and locale in the order message (SWHR8-T-0030; SWHR8-R-0193)
- [ ] 2.2 Implement automatic approval by locale and total (US < 500, JP < 50000) (SWHR8-T-0030; SWHR8-R-0195, SWHR8-R-0196)
- [ ] 2.3 Hold all other orders as PENDING and settle the zh_CN behaviour (SWHR8-T-0030; SWHR8-R-0194, SWHR8-R-0195)
- [ ] 2.4 Apply decisions only to PENDING orders (SWHR8-T-0030; SWHR8-R-0087)
- [ ] 2.5 Validate incoming approval documents (SWHR8-T-0030; SWHR8-R-0086)

## 3. Status operations

- [ ] 3.1 Create the status record on order receipt (SWHR8-T-0030; SWHR8-R-0084)
- [ ] 3.2 Update and read status by order id with not-found error (SWHR8-T-0030; SWHR8-R-0085)

## 4. Messaging

- [ ] 4.1 Implement the shared asynchronous send to one queue (SWHR8-T-0030; SWHR8-R-0090)
- [ ] 4.2 Raise send failures to the caller (SWHR8-T-0030; SWHR8-R-0088)
- [ ] 4.3 Perform the send within the caller's transaction (SWHR8-T-0030; SWHR8-R-0089)
