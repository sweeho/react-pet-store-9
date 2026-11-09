## 1. Data model

- [ ] 1.1 Define supplier order, supplier line item and contact records with their mandatory fields and keys
- [ ] 1.2 Define the inventory record (one quantity per item, never negative)
- [ ] 1.3 Define purchase order, line item and order process-status records
- [ ] 1.4 Define named identifier counters for order and purchase-order ids
- [ ] 1.5 Implement cascade delete of contact, credit card and line items

## 2. Supplier order intake

- [ ] 2.1 Consume purchase order messages from the supplier purchase-order queue and persist supplier orders as PENDING
- [ ] 2.2 Default a missing or malformed order date to the current date
- [ ] 2.3 Support lookup of supplier orders by status

## 3. Fulfilment and invoicing

- [ ] 3.1 Ship a line in full only when stock suffices, deduct stock and mark the line shipped
- [ ] 3.2 Treat unstocked items as unavailable without error
- [ ] 3.3 Mark an order COMPLETED only when every line shipped in the attempt
- [ ] 3.4 Build the invoice with only the lines shipped in the attempt and publish it to the invoice topic
- [ ] 3.5 Re-process PENDING orders in the same transaction as a stock update

## 4. Inventory update

- [ ] 4.1 Provide the stock clerk view and update of inventory quantities
- [ ] 4.2 Ignore blank and negative quantities
- [ ] 4.3 Restrict the update to administrators with form login

## 5. Order center completion

- [ ] 5.1 Build the supplier purchase order for each newly approved order and send it to the queue
- [ ] 5.2 Add invoiced quantities to line items on invoice receipt
- [ ] 5.3 Set COMPLETED or SHIPPED_PART and trigger the completed-order notification only on completion
- [ ] 5.4 Maintain order process-status records and list them by status

## 6. Documents and messaging

- [ ] 6.1 Produce and consume the supplier order, purchase order and invoice documents with their fields
- [ ] 6.2 Format dates as yyyy-MM-dd and encode documents in UTF-8 with indentation
- [ ] 6.3 Validate incoming documents and reject mismatched types
- [ ] 6.4 Configure the order, approval, purchase-order and mail queues and the invoice topic

## 7. Resource lookup

- [ ] 7.1 Resolve named resources through one lookup component wrapping failures in a single error
- [ ] 7.2 Cache resolved resources on the web tier and never cache configuration entries
- [ ] 7.3 Support pluggable transition delegates selected by class name
