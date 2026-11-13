// Takes the online database backup and prunes old ones: `bun run batch:backup`.
import { runBackupJob } from "../server/jobs/inventory-store";

process.exit(await runBackupJob());
