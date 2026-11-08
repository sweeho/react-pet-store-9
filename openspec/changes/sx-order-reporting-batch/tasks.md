## 1. Order extract

- [ ] 1.1 Implement the daily previous-day order export with the seven columns and no header
- [ ] 1.2 Append the trailer line and send the finance failure mail
- [ ] 1.3 Hold the extract until the backup has succeeded

## 2. Aging report

- [ ] 2.1 List PENDING/APPROVED orders older than the stuck-order limit
- [ ] 2.2 List supplier-COMPLETED mismatches regardless of age
- [ ] 2.3 Include order counts per status
- [ ] 2.4 End with code 4 when anything is listed

## 3. Weekly purge

- [ ] 3.1 Purge COMPLETED/DENIED orders older than retention with all dependent records in one transaction
- [ ] 3.2 Never purge PENDING or APPROVED orders
- [ ] 3.3 Run only on Sundays after a successful extract

## 4. Scheduling and settings

- [ ] 4.1 Implement the nightly chain, schedule and dependencies
- [ ] 4.2 Provide batch settings and the 0/4/8 exit code contract

## 5. Order retrieval

- [ ] 5.1 Retrieve orders by inclusive date range
- [ ] 5.2 Support lookup by user and by order date
