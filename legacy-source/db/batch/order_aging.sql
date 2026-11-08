-- PS_ORDER_AGING_REPORT: orders still PENDING or APPROVED after 24 hours.
-- PENDING = waiting for the admin client. APPROVED = sent to the supplier, no invoice yet.
-- :CUTOFF_MS is now minus 24 hours in epoch milliseconds. Report rows start with STUCK.
SELECT 'STUCK' AS chk, p.po_id, p.po_user_id, p.po_locale, p.po_value, m.status
  FROM purchase_order p JOIN order_manager m ON m.order_id = p.po_id
 WHERE m.status IN ('PENDING', 'APPROVED') AND p.po_date < :CUTOFF_MS
 ORDER BY p.po_date;

SELECT status, COUNT(*) AS orders FROM order_manager GROUP BY status ORDER BY status;

-- Supplier invoiced (COMPLETED) but the OPC never closed the order: the invoice message was lost.
SELECT 'MISMATCH' AS chk, m.order_id, m.status, s.po_status
  FROM order_manager m JOIN supplier_order s ON s.po_id = m.order_id
 WHERE s.po_status = 'COMPLETED' AND m.status <> 'COMPLETED';
