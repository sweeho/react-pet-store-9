/* eslint-disable @typescript-eslint/no-unused-vars -- red-phase stub */
export type JobResult = { exitCode: number };
export type JobName = "backup" | "extract" | "agingReport" | "inventoryReport" | "purge";
export type ChainJobs = Record<JobName, () => JobResult | Promise<JobResult>>;

export async function runNightlyChain(_input: {
  date: Date;
  jobs: ChainJobs;
  waitUntil?: (at: string) => Promise<void>;
}): Promise<{ ran: { job: JobName; at: string }[] }> {
  throw new Error("VortexNotImplemented");
}
