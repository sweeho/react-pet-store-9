// Order aging report CLI (design B1): `bun scripts/order-aging-report.ts` runs the job against sqlite.db and exits 0 / 4 / 8.
import { runAgingJob } from "../server/jobs/order-batch-store";

process.exit(await runAgingJob());
