// The nightly chain CLI (design B4, B5). Start it once a night at 01:00; it waits for each slot.
import { runExtractJob, runAgingJob, runPurgeJob } from "../server/jobs/order-batch-store";
import { runBackupJob, runInventoryJob } from "../server/jobs/inventory-store";
import { runNightlyChain } from "../server/jobs/schedule";

const waitUntil = async (at: string): Promise<void> => {
  const [h, m] = at.split(":").map(Number);
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m);
  const ms = target.getTime() - now.getTime();
  if (ms > 0) await new Promise((resolve) => setTimeout(resolve, ms));
};

const date = new Date();
const { ran } = await runNightlyChain({
  date,
  waitUntil,
  jobs: {
    backup: async () => ({ exitCode: await runBackupJob() }),
    extract: async () => ({ exitCode: await runExtractJob() }),
    agingReport: async () => ({ exitCode: await runAgingJob() }),
    inventoryReport: async () => ({ exitCode: await runInventoryJob() }),
    purge: async () => ({ exitCode: await runPurgeJob() }),
  },
});
console.log(`Nightly chain ran: ${ran.map((r) => `${r.job}@${r.at}`).join(", ")}`);
process.exit(ran.length < 4 ? 8 : 0);
