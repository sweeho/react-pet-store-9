// Batch settings from the environment (design B2).
export interface BatchSettings {
  retentionDays: number;
  stuckHours: number;
  outDir: string;
  mailFinance: string;
  mailOps: string;
}

const positive = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return raw !== undefined && raw !== "" && Number.isFinite(n) && n > 0 ? n : fallback;
};

export function batchSettings(env: NodeJS.ProcessEnv = process.env): BatchSettings {
  return {
    retentionDays: positive(env.BATCH_RETENTION_DAYS, 180),
    stuckHours: positive(env.BATCH_STUCK_HOURS, 24),
    outDir: env.BATCH_OUT_DIR || "./batch-out",
    mailFinance: env.BATCH_MAIL_FINANCE || "ps-finance",
    mailOps: env.BATCH_MAIL_OPS || "ps-ops",
  };
}
