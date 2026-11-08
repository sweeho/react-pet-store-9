#!/bin/sh
# Pet Store batch environment. Sourced by every script in batch/.
PS_HOME=${PS_HOME:-/opt/petstore}
PS_CONF=$PS_HOME/conf
PS_SQL=$PS_HOME/db/batch
PS_LOG_DIR=${PS_LOG_DIR:-/var/petstore/log}
PS_BACKUP_DIR=${PS_BACKUP_DIR:-/var/petstore/backup}
PS_EXTRACT_DIR=${PS_EXTRACT_DIR:-/var/petstore/extract}
PS_TMP_DIR=${PS_TMP_DIR:-/var/petstore/tmp}
PS_STORE_URL=${PS_STORE_URL:-http://psl-app01:8000/petstore}
PS_OPC_URL=${PS_OPC_URL:-http://psl-app01:8000/opc}
PS_SUPPLIER_URL=${PS_SUPPLIER_URL:-http://psl-app01:8000/supplier}
PS_ADMIN_URL=${PS_ADMIN_URL:-http://psl-app01:8000/admin}
PS_DB_URL="jdbc:derby://localhost:1527//var/petstore/db/PetStoreDB;user=estoreuser;password=estore"
PS_ORDER_RETENTION_DAYS=180
PS_BACKUP_KEEP_DAYS=7
PS_STUCK_ORDER_HOURS=24
PS_LOW_STOCK_QTY=500
DERBY_LIB=${DERBY_LIB:-/opt/derby/lib}
JAVA_CMD=${JAVA_HOME:+$JAVA_HOME/bin/}java
export PS_HOME PS_CONF PS_SQL PS_LOG_DIR PS_BACKUP_DIR PS_EXTRACT_DIR PS_TMP_DIR PS_STORE_URL PS_OPC_URL \
       PS_SUPPLIER_URL PS_ADMIN_URL PS_DB_URL DERBY_LIB JAVA_CMD

# Run a SQL script with Derby ij against the store database.
# Usage: ps_ij <script.sql>   Fails when ij reports an ERROR line.
ps_ij() {
  out=$("$JAVA_CMD" -cp "$DERBY_LIB/derbytools.jar:$DERBY_LIB/derbyclient.jar" \
        -Dij.connection.ps="$PS_DB_URL" -Dij.outfile=/dev/stdout \
        org.apache.derby.tools.ij "$1" 2>&1)
  echo "$out"
  echo "$out" | grep -q "^ERROR" && return 1
  return 0
}

# Epoch milliseconds of local midnight, N days ago. Usage: ps_midnight_ms 1
ps_midnight_ms() {
  s=$(date -d "$1 days ago 00:00" '+%s' 2>/dev/null || date -v-"$1"d -v0H -v0M -v0S '+%s')
  echo "${s}000"
}

# Copy a SQL file replacing :NAME placeholders. Usage: ps_sql_bind in.sql out.sql NAME=value ...
ps_sql_bind() {
  in=$1; out=$2; shift 2
  cp "$in" "$out"
  for kv in "$@"; do
    sed "s|:${kv%%=*}|${kv#*=}|g" "$out" > "$out.tmp" && mv "$out.tmp" "$out"
  done
}

# Write a time-stamped line to the job log and stdout.
ps_log() {
  echo "$(date '+%Y-%m-%d %H:%M:%S') [$PS_JOB] $*" | tee -a "$PS_LOG_DIR/batch.log"
}
