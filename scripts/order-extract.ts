// Order extract CLI (design B1): `bun scripts/order-extract.ts` runs the job against sqlite.db and exits 0 / 4 / 8.
import { runExtractJob } from "../server/jobs/order-batch-store";

process.exit(await runExtractJob());
