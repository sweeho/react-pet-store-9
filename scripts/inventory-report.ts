// Writes inventory_YYYYMMDD.txt and exits with its code: `bun run batch:inventory`.
import { runInventoryJob } from "../server/jobs/inventory-store";

process.exit(await runInventoryJob());
