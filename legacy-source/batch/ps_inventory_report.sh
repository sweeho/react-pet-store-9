#!/bin/sh
# PS_INVENTORY_REPORT - daily 01:50 after PS_ORDER_EXTRACT.
# Lists supplier items with stock below PS_LOW_STOCK_QTY to inventory_YYYYMMDD.txt.
PS_JOB=PS_INVENTORY_REPORT
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
DAY=$(date '+%Y%m%d')
OUT="$PS_EXTRACT_DIR/inventory_$DAY.txt"
SQL="$PS_TMP_DIR/inventory_report.sql"
ps_log "start threshold=$PS_LOW_STOCK_QTY"
ps_sql_bind "$PS_SQL/inventory_report.sql" "$SQL" LOW_QTY="$PS_LOW_STOCK_QTY"
ps_ij "$SQL" > "$OUT" || { ps_log "FAILED"; exit 8; }
ps_log "end OK file=$OUT"
exit 0
