// Probes the four web areas and exits 8 when any is down: `bun run batch:health`. PM2 runs it every 10 minutes.
import { batchSettings } from "../server/jobs/batch-settings";
import { runHealthCheck } from "../server/jobs/health-check";

const { exitCode, log } = await runHealthCheck({
  modules: batchSettings().healthUrls,
  fetch,
});
for (const line of log) console.log(`${new Date().toISOString()} ${line}`);
process.exit(exitCode);
