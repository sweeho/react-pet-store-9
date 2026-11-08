// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/jobs/schedule.ts exports
//   runNightlyChain({ date, jobs }): Promise<{ ran: { job: string; at: string }[] }>
// date: the Date of the night (local). jobs: { backup, extract, agingReport, inventoryReport, purge }, each
// () => { exitCode: number } | Promise<{ exitCode: number }>.
// The chain runs backup (01:00); extract (01:30) only if backup exited 0; then agingReport (01:45),
// inventoryReport (01:50) and, on Sundays only, purge (02:00), each only if the extract exited 0.
// `ran` lists, in order, each job actually started with its scheduled time "HH:MM".
// Job names in `ran`: "backup", "extract", "agingReport", "inventoryReport", "purge".
const loadSchedule = () => import("../../../server/jobs/schedule");

const ok = () => ({ exitCode: 0 });
const fail = () => ({ exitCode: 8 });
const sunday = new Date(2026, 2, 22);

describe("nightly batch chain", () => {
  // case: SWHR8-C-0124@v1
  it("[SWHR8-C-0124] does not run extract, aging report, inventory report or purge when the backup fails", async () => {
    const { runNightlyChain } = await loadSchedule();
    const started: string[] = [];
    const track = (name: string, result: () => { exitCode: number }) => () => {
      started.push(name);
      return result();
    };

    const { ran } = await runNightlyChain({
      date: sunday,
      jobs: {
        backup: track("backup", fail),
        extract: track("extract", ok),
        agingReport: track("agingReport", ok),
        inventoryReport: track("inventoryReport", ok),
        purge: track("purge", ok),
      },
    });

    expect(started).toEqual(["backup"]);
    expect(ran.map((r) => r.job)).toEqual(["backup"]);
  });

  // case: SWHR8-C-0125@v1
  it("[SWHR8-C-0125] on a Sunday runs the aging report, inventory report and purge at 01:45, 01:50 and 02:00", async () => {
    const { runNightlyChain } = await loadSchedule();

    const { ran } = await runNightlyChain({
      date: sunday,
      jobs: { backup: ok, extract: ok, agingReport: ok, inventoryReport: ok, purge: ok },
    });

    const at = Object.fromEntries(ran.map((r) => [r.job, r.at]));
    expect(at.agingReport).toBe("01:45");
    expect(at.inventoryReport).toBe("01:50");
    expect(at.purge).toBe("02:00");
    expect(ran.map((r) => r.job)).toEqual([
      "backup",
      "extract",
      "agingReport",
      "inventoryReport",
      "purge",
    ]);
  });
});
