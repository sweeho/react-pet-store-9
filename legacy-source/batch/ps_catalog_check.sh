#!/bin/sh
# PS_CATALOG_CHECK - daily 06:00 before the store opens.
# Runs the catalog integrity checks. When the catalog tables are missing it asks
# the store to populate itself (first load, not a forced reload). Any failed
# check ends the job with code 4 so operations is alerted.
PS_JOB=PS_CATALOG_CHECK
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
ps_log "start"
OUT=$(ps_ij "$PS_SQL/catalog_check.sql")
if echo "$OUT" | grep -q "does not exist"; then
  ps_log "catalog tables missing, requesting first load"
  curl -sf -o /dev/null "$PS_STORE_URL/Populate?forcefully=false" || { ps_log "FAILED: populate"; exit 8; }
  OUT=$(ps_ij "$PS_SQL/catalog_check.sql")
fi
echo "$OUT" >> "$PS_LOG_DIR/catalog_check.log"
if echo "$OUT" | grep -qE "^C[1-5] "; then
  ps_log "FAILED: integrity check found rows"
  exit 4
fi
ps_log "end OK"
exit 0
