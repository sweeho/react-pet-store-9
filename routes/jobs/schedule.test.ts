// @vitest-environment node
import { describe, expect, it } from "vitest";

import { runNightlyChain, type ChainJobs } from "../../server/jobs/schedule";

const ok = () => ({ exitCode: 0 });
const sunday = new Date(2026, 2, 22);
const monday = new Date(2026, 2, 23);
const all = (f: () => { exitCode: number }): ChainJobs => ({
  backup: f,
  extract: f,
  agingReport: f,
  inventoryReport: f,
  purge: f,
});

describe("runNightlyChain", () => {
  it("[SWHR8-C-0124] runs nothing after a failed backup", async () => {
    const started: string[] = [];
    const jobs = all(ok);
    jobs.backup = () => {
      started.push("backup");
      return { exitCode: 8 };
    };
    const { ran } = await runNightlyChain({ date: sunday, jobs });
    expect(started).toEqual(["backup"]);
    expect(ran).toEqual([{ job: "backup", at: "01:00" }]);
  });

  it("[SWHR8-C-0125] on Sunday runs all jobs at their slots, waiting for each", async () => {
    const waited: string[] = [];
    const { ran } = await runNightlyChain({
      date: sunday,
      jobs: all(ok),
      waitUntil: async (at) => void waited.push(at),
    });
    const slots = [
      ["backup", "01:00"],
      ["extract", "01:30"],
      ["agingReport", "01:45"],
      ["inventoryReport", "01:50"],
      ["purge", "02:00"],
    ];
    expect(ran.map((r) => [r.job, r.at])).toEqual(slots);
    expect(waited).toEqual(slots.map((s) => s[1]));
  });

  it("[SWHR8-C-0125] skips the purge on other days and the reports after a failed extract", async () => {
    expect((await runNightlyChain({ date: monday, jobs: all(ok) })).ran.map((r) => r.job)).toEqual([
      "backup",
      "extract",
      "agingReport",
      "inventoryReport",
    ]);
    const jobs = all(ok);
    jobs.extract = () => ({ exitCode: 8 });
    expect((await runNightlyChain({ date: sunday, jobs })).ran.map((r) => r.job)).toEqual([
      "backup",
      "extract",
    ]);
  });
});
