#!/bin/sh
# PS_ORDER_PURGE - weekly Sunday 02:00 after PS_ORDER_EXTRACT.
# Deletes COMPLETED and DENIED orders older than 180 days, with their lines,
# supplier orders, contact information, addresses and payment cards.
PS_JOB=PS_ORDER_PURGE
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
SQL="$PS_TMP_DIR/order_purge.sql"
CUTOFF_MS=$(ps_midnight_ms "$PS_ORDER_RETENTION_DAYS")
ps_log "start retention=${PS_ORDER_RETENTION_DAYS}d cutoff_ms=$CUTOFF_MS"
ps_sql_bind "$PS_SQL/order_purge.sql" "$SQL" CUTOFF_MS="$CUTOFF_MS"
ps_ij "$SQL" >> "$PS_LOG_DIR/order_purge.log" || { ps_log "FAILED"; exit 8; }
ps_log "end OK"
exit 0
