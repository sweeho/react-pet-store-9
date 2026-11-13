// The nightly batch chain (design B4, B5): decides which jobs start and stamps each with its slot.
import { EXIT_ERROR } from "./batch-types";

export type JobResult = { exitCode: number };
export type JobName = "backup" | "extract" | "agingReport" | "inventoryReport" | "purge";
export type ChainJobs = Record<JobName, () => JobResult | Promise<JobResult>>;

const SLOTS: Record<JobName, string> = {
  backup: "01:00",
  extract: "01:30",
  agingReport: "01:45",
  inventoryReport: "01:50",
  purge: "02:00",
};
const SUNDAY = 0;

export async function runNightlyChain(input: {
  date: Date;
  jobs: ChainJobs;
  waitUntil?: (at: string) => Promise<void>;
}): Promise<{ ran: { job: JobName; at: string }[] }> {
  const ran: { job: JobName; at: string }[] = [];
  const run = async (job: JobName): Promise<number> => {
    const at = SLOTS[job];
    await input.waitUntil?.(at);
    ran.push({ job, at });
    try {
      return (await input.jobs[job]()).exitCode;
    } catch (error) {
      console.error(`${job} failed:`, error);
      return EXIT_ERROR;
    }
  };

  if ((await run("backup")) !== 0) return { ran };
  if ((await run("extract")) !== 0) return { ran };
  await run("agingReport");
  await run("inventoryReport");
  if (input.date.getDay() === SUNDAY) await run("purge");
  return { ran };
}
