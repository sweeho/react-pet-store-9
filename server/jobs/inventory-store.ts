// Database side of the backup and inventory report jobs (design I1, I3, I6), mirroring order-batch-store.ts.
import { and, eq } from "drizzle-orm";

import { db } from "../../db/client";
import { inventory, item, itemDetails } from "../../db/schema";
import { batchSettings } from "./batch-settings";
import { runBackup } from "./backup";
import { runInventoryReport } from "./inventory-report";

/** Every inventory row with its en_US description (empty when the item has none). */
export async function runInventoryJob(now = new Date()): Promise<number> {
  const s = batchSettings();
  const rows = db
    .select({
      itemId: inventory.itemId,
      productId: item.productId,
      description: itemDetails.description,
      quantity: inventory.quantity,
    })
    .from(inventory)
    .leftJoin(item, eq(item.id, inventory.itemId))
    .leftJoin(
      itemDetails,
      and(eq(itemDetails.itemId, inventory.itemId), eq(itemDetails.locale, "en_US")),
    )
    .all();
  const { file, exitCode } = await runInventoryReport({
    items: rows.map((r) => ({
      itemId: r.itemId,
      productId: r.productId ?? "",
      description: r.description ?? "",
      quantity: r.quantity,
    })),
    outDir: s.outDir,
    now,
    lowStockQty: s.lowStockQty,
  });
  console.log(`Inventory report ${file} (exit ${exitCode})`);
  return exitCode;
}

export async function runBackupJob(now = new Date()): Promise<number> {
  const s = batchSettings();
  const { exitCode } = await runBackup({
    backupRoot: s.backupDir,
    now,
    retentionDays: s.backupKeepDays,
  });
  console.log(`Backup (exit ${exitCode})`);
  return exitCode;
}
