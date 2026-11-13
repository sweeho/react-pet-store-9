// Batch settings from the environment (design B2).
export interface BatchSettings {
  retentionDays: number;
  stuckHours: number;
  outDir: string;
  mailFinance: string;
  mailOps: string;
  lowStockQty: number;
  backupKeepDays: number;
  backupDir: string;
  storeUrl: string;
  healthUrls: { storefront: string; ordercenter: string; supplier: string; admin: string };
}

const positive = (raw: string | undefined, fallback: number): number => {
  const n = Number(raw);
  return raw !== undefined && raw !== "" && Number.isFinite(n) && n > 0 ? n : fallback;
};

export function batchSettings(env: NodeJS.ProcessEnv = process.env): BatchSettings {
  const storeUrl = (env.BATCH_STORE_URL || "http://127.0.0.1:3000").replace(/\/+$/, "");
  return {
    retentionDays: positive(env.BATCH_RETENTION_DAYS, 180),
    stuckHours: positive(env.BATCH_STUCK_HOURS, 24),
    outDir: env.BATCH_OUT_DIR || "./batch-out",
    mailFinance: env.BATCH_MAIL_FINANCE || "ps-finance",
    mailOps: env.BATCH_MAIL_OPS || "ps-ops",
    lowStockQty: positive(env.BATCH_LOW_STOCK_QTY, 500),
    backupKeepDays: positive(env.BATCH_BACKUP_KEEP_DAYS, 7),
    backupDir: env.BATCH_BACKUP_DIR || "./backup",
    storeUrl,
    healthUrls: {
      storefront: env.BATCH_HEALTH_URL_STOREFRONT || `${storeUrl}/`,
      ordercenter: env.BATCH_HEALTH_URL_ORDERCENTER || `${storeUrl}/admin/orders`,
      supplier: env.BATCH_HEALTH_URL_SUPPLIER || `${storeUrl}/admin/inventory`,
      admin: env.BATCH_HEALTH_URL_ADMIN || `${storeUrl}/admin`,
    },
  };
}
