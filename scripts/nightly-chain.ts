// The nightly chain CLI (design B4, B5). Start it once a night at 01:00; it waits for each slot.
import { runExtractJob, runAgingJob, runPurgeJob } from "../server/jobs/order-batch-store";
import { runNightlyChain } from "../server/jobs/schedule";

// Backup and the inventory report belong to SWHR8-I-0013; until it lands they are placeholders.
const placeholder = (name: string) => async () => {
  console.log(`${name} not installed (SWHR8-I-0013)`);
  return { exitCode: 0 };
};

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
    backup: placeholder("backup"),
    extract: async () => ({ exitCode: await runExtractJob() }),
    agingReport: async () => ({ exitCode: await runAgingJob() }),
    inventoryReport: placeholder("inventory report"),
    purge: async () => ({ exitCode: await runPurgeJob() }),
  },
});
console.log(`Nightly chain ran: ${ran.map((r) => `${r.job}@${r.at}`).join(", ")}`);
process.exit(ran.length < 4 ? 8 : 0);
