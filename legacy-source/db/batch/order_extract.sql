-- PS_ORDER_EXTRACT: export yesterday's purchase orders for Finance.
-- :LO_MS and :HI_MS are epoch milliseconds (yesterday 00:00 and today 00:00),
-- :OUT_FILE is the export target. The script binds them and renames the file
-- to orders_YYYYMMDD.csv.
CALL SYSCS_UTIL.SYSCS_EXPORT_QUERY(
  'SELECT p.po_id, p.po_user_id, p.po_date, p.po_locale, p.po_value,
          (SELECT COUNT(*) FROM po_line_item l WHERE l.po_id = p.po_id),
          m.status
     FROM purchase_order p JOIN order_manager m ON m.order_id = p.po_id
    WHERE p.po_date >= :LO_MS AND p.po_date < :HI_MS
    ORDER BY p.po_id',
  ':OUT_FILE', ',', '"', 'UTF-8');
