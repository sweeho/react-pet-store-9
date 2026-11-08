-- PS_INVENTORY_REPORT: supplier stock below the threshold, lowest first.
-- :LOW_QTY is PS_LOW_STOCK_QTY from conf/env.sh.
SELECT i.item_id, p.productid, d.descn, i.quantity
  FROM inventory i
  JOIN item p ON p.itemid = i.item_id
  JOIN item_details d ON d.itemid = i.item_id AND d.locale = 'en_US'
 WHERE i.quantity < :LOW_QTY
 ORDER BY i.quantity, i.item_id;

SELECT COUNT(*) AS items_tracked, SUM(quantity) AS units_in_stock FROM inventory;
