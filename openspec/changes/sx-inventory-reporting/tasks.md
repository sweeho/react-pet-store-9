## 1. Inventory report

- [ ] 1.1 Implement the low-stock extract query with threshold, ordering and English description join
- [ ] 1.2 Append items-tracked and total-units summary and write the dated output file
- [ ] 1.3 Make the low-stock threshold configurable with default 500

## 2. Catalog integrity checks

- [ ] 2.1 Implement checks C1 to C5 and the non-zero result when any returns rows
- [ ] 2.2 Append results to the catalog check log
- [ ] 2.3 Implement the missing-catalog first-load recovery and its failure result

## 3. Data load endpoint

- [ ] 3.1 Provide the populate endpoint with non-forced and forced modes

## 4. Database backup

- [ ] 4.1 Take the daily online backup into a dated folder
- [ ] 4.2 Prune backups older than the retention period (default 7 days)
- [ ] 4.3 Return failure code on backup failure

## 5. Health check

- [ ] 5.1 Probe four web modules every 10 minutes with a 20 second timeout
- [ ] 5.2 Log failing modules and return failure code

## 6. Admin sales reports

- [ ] 6.1 Provide revenue and order-quantity summaries by date range and optional category
- [ ] 6.2 Return session-timeout and unknown-request errors

## 7. Diagnostics

- [ ] 7.1 Provide a diagnostic output helper disabled by default

## 8. Configuration thresholds

- [ ] 8.1 Expose the low-stock threshold (default 500) and backup retention (default 7 days) as configuration
