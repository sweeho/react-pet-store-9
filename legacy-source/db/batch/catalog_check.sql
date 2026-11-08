-- PS_CATALOG_CHECK: catalog integrity checks. Each query must return 0 rows;
-- the script fails the job (code 4) when any row starts with C1 to C5.
-- C1: categories with no product
SELECT 'C1' AS chk, c.catid FROM category c
 WHERE NOT EXISTS (SELECT 1 FROM product p WHERE p.catid = c.catid);
-- C2: products with no item
SELECT 'C2' AS chk, p.productid FROM product p
 WHERE NOT EXISTS (SELECT 1 FROM item i WHERE i.productid = p.productid);
-- C3: items priced below cost
SELECT 'C3' AS chk, itemid, locale FROM item_details WHERE listprice < unitcost;
-- C4: items missing a description for a locale the store serves (en_US, ja_JP, zh_CN)
SELECT 'C4' AS chk, i.itemid, l.locale FROM item i, category_details l
 WHERE l.catid = (SELECT p.catid FROM product p WHERE p.productid = i.productid)
   AND NOT EXISTS (SELECT 1 FROM item_details d WHERE d.itemid = i.itemid AND d.locale = l.locale);
-- C5: items the supplier does not stock
SELECT 'C5' AS chk, i.itemid FROM item i
 WHERE NOT EXISTS (SELECT 1 FROM inventory v WHERE v.item_id = i.itemid);
-- Totals for the log
SELECT COUNT(*) AS categories FROM category;
SELECT COUNT(*) AS items FROM item;
