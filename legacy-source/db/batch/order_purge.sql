-- PS_ORDER_PURGE: delete COMPLETED and DENIED orders older than 180 days.
-- Runs only after PS_ORDER_EXTRACT so every order has been extracted first.
-- :CUTOFF_MS is the retention limit in epoch milliseconds.
AUTOCOMMIT OFF;

DECLARE GLOBAL TEMPORARY TABLE session.purge_po
  (po_id VARCHAR(40), contact_id VARCHAR(40), card_id VARCHAR(40), address_id VARCHAR(40))
  ON COMMIT PRESERVE ROWS NOT LOGGED;

INSERT INTO session.purge_po
  SELECT p.po_id, p.contact_id, p.card_id, c.address_id
    FROM purchase_order p
    JOIN order_manager m ON m.order_id = p.po_id
    JOIN contact_info c ON c.contact_id = p.contact_id
   WHERE m.status IN ('COMPLETED', 'DENIED') AND p.po_date < :CUTOFF_MS;

DELETE FROM supplier_line_item WHERE po_id IN (SELECT po_id FROM session.purge_po);
DELETE FROM supplier_order     WHERE po_id IN (SELECT po_id FROM session.purge_po);
DELETE FROM po_line_item       WHERE po_id IN (SELECT po_id FROM session.purge_po);
DELETE FROM order_manager      WHERE order_id IN (SELECT po_id FROM session.purge_po);
DELETE FROM purchase_order     WHERE po_id IN (SELECT po_id FROM session.purge_po);
DELETE FROM contact_info       WHERE contact_id IN (SELECT contact_id FROM session.purge_po);
DELETE FROM address            WHERE address_id IN (SELECT address_id FROM session.purge_po);
DELETE FROM credit_card        WHERE card_id IN (SELECT card_id FROM session.purge_po);

COMMIT;
