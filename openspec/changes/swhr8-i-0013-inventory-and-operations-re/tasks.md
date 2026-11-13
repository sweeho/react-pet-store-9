## 1. Inventory report

- [x] 1.1 Implement the low-stock extract query with threshold, ordering and English description join (SWHR8-T-0054; SWHR8-R-0069, SWHR8-R-0063, SWHR8-R-0147)
- [x] 1.2 Append items-tracked and total-units summary and write the dated output file (SWHR8-T-0054; SWHR8-R-0069, SWHR8-R-0063)
- [x] 1.3 Make the low-stock threshold configurable with default 500 (SWHR8-T-0054; SWHR8-R-0147)

## 2. Catalog integrity checks

- [x] 2.1 Implement checks C1 to C5 and the non-zero result when any returns rows (SWHR8-T-0054; SWHR8-R-0064)
- [x] 2.2 Append results to the catalog check log (SWHR8-T-0054; SWHR8-R-0064)
- [x] 2.3 Implement the missing-catalog first-load recovery and its failure result (SWHR8-T-0054; SWHR8-R-0065)

## 3. Data load endpoint

- [x] 3.1 Provide the populate endpoint with non-forced and forced modes (SWHR8-T-0054; SWHR8-R-0070)

## 4. Database backup

- [x] 4.1 Take the daily online backup into a dated folder (SWHR8-T-0054; SWHR8-R-0066)
- [x] 4.2 Prune backups older than the retention period (default 7 days) (SWHR8-T-0054; SWHR8-R-0062, SWHR8-R-0066)
- [x] 4.3 Return failure code on backup failure (SWHR8-T-0054; SWHR8-R-0066)

## 5. Health check

- [x] 5.1 Probe four web modules every 10 minutes with a 20 second timeout (SWHR8-T-0054; SWHR8-R-0067)
- [x] 5.2 Log failing modules and return failure code (SWHR8-T-0054; SWHR8-R-0067)

## 6. Admin sales reports

- [x] 6.1 Provide revenue and order-quantity summaries by date range and optional category (SWHR8-T-0054; SWHR8-R-0186)
- [x] 6.2 Return session-timeout and unknown-request errors (SWHR8-T-0054; SWHR8-R-0186)

## 7. Diagnostics

- [x] 7.1 Provide a diagnostic output helper disabled by default (SWHR8-T-0054; SWHR8-R-0068)

## 8. Configuration thresholds

- [x] 8.1 Expose the low-stock threshold (default 500) and backup retention (default 7 days) as configuration (SWHR8-T-0054; SWHR8-R-0147, SWHR8-R-0062)
