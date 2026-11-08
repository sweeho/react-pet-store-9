#!/bin/sh
# PS_ORDER_EXTRACT - daily 01:30 after PS_DB_BACKUP.
# Exports yesterday's purchase orders to orders_YYYYMMDD.csv for Finance.
# No header. Last line is TRAILER,YYYYMMDD,row count.
PS_JOB=PS_ORDER_EXTRACT
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
DAY=$(date -d yesterday '+%Y%m%d' 2>/dev/null || date -v-1d '+%Y%m%d')
OUT="$PS_EXTRACT_DIR/orders_$DAY.csv"
SQL="$PS_TMP_DIR/order_extract.sql"
ps_log "start day=$DAY"
ps_sql_bind "$PS_SQL/order_extract.sql" "$SQL" LO_MS="$(ps_midnight_ms 1)" HI_MS="$(ps_midnight_ms 0)" OUT_FILE="$PS_EXTRACT_DIR/orders_extract.csv"
rm -f "$PS_EXTRACT_DIR/orders_extract.csv"
ps_ij "$SQL" > /dev/null || { ps_log "FAILED: export"; exit 8; }
mv "$PS_EXTRACT_DIR/orders_extract.csv" "$OUT"
ROWS=$(wc -l < "$OUT" | tr -d ' ')
echo "TRAILER,$DAY,$ROWS" >> "$OUT"
ps_log "end OK file=$OUT rows=$ROWS"
exit 0
