-- PS_DB_BACKUP: online backup of PetStoreDB.
-- Derby writes /var/petstore/backup/PetStoreDB; the script moves it to a dated folder.
CALL SYSCS_UTIL.SYSCS_BACKUP_DATABASE('/var/petstore/backup');
