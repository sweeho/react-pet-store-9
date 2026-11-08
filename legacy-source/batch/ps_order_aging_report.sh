#!/bin/sh
# PS_ORDER_AGING_REPORT - daily 01:45 after PS_ORDER_EXTRACT.
# Lists orders not COMPLETED or DENIED after 24 hours (stuck in the OPC flow)
# to order_aging_YYYYMMDD.txt. Ends with code 4 when any order is listed.
PS_JOB=PS_ORDER_AGING_REPORT
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
DAY=$(date '+%Y%m%d')
OUT="$PS_EXTRACT_DIR/order_aging_$DAY.txt"
SQL="$PS_TMP_DIR/order_aging.sql"
CUTOFF_MS=$(( $(date '+%s') * 1000 - PS_STUCK_ORDER_HOURS * 3600000 ))
ps_log "start cutoff_hours=$PS_STUCK_ORDER_HOURS"
ps_sql_bind "$PS_SQL/order_aging.sql" "$SQL" CUTOFF_MS="$CUTOFF_MS"
ps_ij "$SQL" > "$OUT" || { ps_log "FAILED"; exit 8; }
if grep -qE "^(STUCK|MISMATCH) " "$OUT"; then
  ps_log "end WARNING stuck orders listed in $OUT"
  exit 4
fi
ps_log "end OK file=$OUT"
exit 0
