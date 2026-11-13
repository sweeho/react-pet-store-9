## 1. Data model

- [x] 1.1 Define supplier order, supplier line item and contact records with their mandatory fields and keys (SWHR8-T-0038; SWHR8-R-0013, SWHR8-R-0014, SWHR8-R-0150, SWHR8-R-0152, SWHR8-R-0213)
- [x] 1.2 Define the inventory record (one quantity per item, never negative) (SWHR8-T-0038; SWHR8-R-0102, SWHR8-R-0109, SWHR8-R-0150)
- [x] 1.3 Define purchase order, line item and order process-status records (SWHR8-T-0038; SWHR8-R-0111, SWHR8-R-0112, SWHR8-R-0118, SWHR8-R-0120)
- [x] 1.4 Define named identifier counters for order and purchase-order ids (SWHR8-T-0038; SWHR8-R-0101)
- [x] 1.5 Implement cascade delete of contact, credit card and line items (SWHR8-T-0038; SWHR8-R-0113)

## 2. Supplier order intake

- [x] 2.1 Consume purchase order messages from the supplier purchase-order queue and persist supplier orders as PENDING (SWHR8-T-0038; SWHR8-R-0012, SWHR8-R-0104, SWHR8-R-0108, SWHR8-R-0116)
- [x] 2.2 Default a missing or malformed order date to the current date (SWHR8-T-0038; SWHR8-R-0107)
- [x] 2.3 Support lookup of supplier orders by status (SWHR8-T-0038; SWHR8-R-0114)

## 3. Fulfilment and invoicing

- [x] 3.1 Ship a line in full only when stock suffices, deduct stock and mark the line shipped (SWHR8-T-0038; SWHR8-R-0010, SWHR8-R-0123, SWHR8-R-0214)
- [x] 3.2 Treat unstocked items as unavailable without error (SWHR8-T-0038; SWHR8-R-0011, SWHR8-R-0103)
- [x] 3.3 Mark an order COMPLETED only when every line shipped in the attempt (SWHR8-T-0038; SWHR8-R-0022, SWHR8-R-0124)
- [x] 3.4 Build the invoice with only the lines shipped in the attempt and publish it to the invoice topic (SWHR8-T-0038; SWHR8-R-0016, SWHR8-R-0023, SWHR8-R-0117, SWHR8-R-0216)
- [x] 3.5 Re-process PENDING orders in the same transaction as a stock update (SWHR8-T-0038; SWHR8-R-0151)

## 4. Inventory update

- [x] 4.1 Provide the stock clerk view and update of inventory quantities (SWHR8-T-0038; SWHR8-R-0009, SWHR8-R-0109)
- [x] 4.2 Ignore blank and negative quantities (SWHR8-T-0038; SWHR8-R-0009)
- [x] 4.3 Restrict the update to administrators with form login (SWHR8-T-0038; SWHR8-R-0215)

## 5. Order center completion

- [x] 5.1 Build the supplier purchase order for each newly approved order and send it to the queue (SWHR8-T-0038; SWHR8-R-0018)
- [x] 5.2 Add invoiced quantities to line items on invoice receipt (SWHR8-T-0038; SWHR8-R-0105, SWHR8-R-0119)
- [x] 5.3 Set COMPLETED or SHIPPED_PART and trigger the completed-order notification only on completion (SWHR8-T-0038; SWHR8-R-0017, SWHR8-R-0106)
- [x] 5.4 Maintain order process-status records and list them by status (SWHR8-T-0038; SWHR8-R-0120)

## 6. Documents and messaging

- [x] 6.1 Produce and consume the supplier order, purchase order and invoice documents with their fields (SWHR8-T-0038; SWHR8-R-0110, SWHR8-R-0115, SWHR8-R-0217, SWHR8-R-0023)
- [x] 6.2 Format dates as yyyy-MM-dd and encode documents in UTF-8 with indentation (SWHR8-T-0038; SWHR8-R-0122, SWHR8-R-0212)
- [x] 6.3 Validate incoming documents and reject mismatched types (SWHR8-T-0038; SWHR8-R-0121)
- [x] 6.4 Configure the order, approval, purchase-order and mail queues and the invoice topic (SWHR8-T-0038; SWHR8-R-0018, SWHR8-R-0016, SWHR8-R-0117)

## 7. Resource lookup

- [x] 7.1 Resolve named resources through one lookup component wrapping failures in a single error (SWHR8-T-0038; SWHR8-R-0154)
- [x] 7.2 Cache resolved resources on the web tier and never cache configuration entries (SWHR8-T-0038; SWHR8-R-0153)
- [x] 7.3 Support pluggable transition delegates selected by class name (SWHR8-T-0038; SWHR8-R-0211)
