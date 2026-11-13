// Order purge CLI (design B1): `bun scripts/order-purge.ts` runs the job against sqlite.db and exits 0 / 4 / 8.
import { runPurgeJob } from "../server/jobs/order-batch-store";

process.exit(await runPurgeJob());
