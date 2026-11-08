#!/bin/sh
# PS_DB_BACKUP - daily 01:00. Online Derby backup of PetStoreDB, keeps 7 days.
PS_JOB=PS_DB_BACKUP
. "${PS_HOME:-/opt/petstore}/conf/env.sh"
STAMP=$(date '+%Y%m%d')
ps_log "start"
rm -rf "$PS_BACKUP_DIR/PetStoreDB"
ps_ij "$PS_SQL/db_backup.sql" > /dev/null || { ps_log "FAILED: backup"; exit 8; }
rm -rf "$PS_BACKUP_DIR/PetStoreDB_$STAMP"
mv "$PS_BACKUP_DIR/PetStoreDB" "$PS_BACKUP_DIR/PetStoreDB_$STAMP"
find "$PS_BACKUP_DIR" -maxdepth 1 -name 'PetStoreDB_*' -mtime +$PS_BACKUP_KEEP_DAYS -exec rm -rf {} \;
ps_log "end OK backup=$PS_BACKUP_DIR/PetStoreDB_$STAMP"
exit 0
