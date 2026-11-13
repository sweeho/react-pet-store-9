/* eslint-disable @typescript-eslint/no-unused-vars -- red-phase stub */
// Batch settings from the environment (design B2).
export interface BatchSettings {
  retentionDays: number;
  stuckHours: number;
  outDir: string;
  mailFinance: string;
  mailOps: string;
}

export function batchSettings(_env: NodeJS.ProcessEnv = process.env): BatchSettings {
  throw new Error("VortexNotImplemented");
}
