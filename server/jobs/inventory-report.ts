// The daily low-stock inventory report (design I3): pure over plain rows, writes inventory_YYYYMMDD.txt.
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { EXIT_ERROR, EXIT_OK, yyyymmdd } from "./batch-types";

export interface InventoryItem {
  itemId: string;
  productId: string;
  /** The en_US description; empty when the item has none. */
  description: string;
  quantity: number;
}

export async function runInventoryReport(input: {
  items: InventoryItem[];
  outDir: string;
  now: Date;
  lowStockQty?: number;
}): Promise<{ file: string; exitCode: number }> {
  const limit = input.lowStockQty ?? 500;
  const file = path.join(input.outDir, `inventory_${yyyymmdd(input.now)}.txt`);
  const listed = input.items
    .filter((i) => i.quantity < limit && i.description !== "")
    .sort((a, b) => a.quantity - b.quantity || a.itemId.localeCompare(b.itemId));
  const lines = listed.map((i) => `${i.itemId} ${i.productId} "${i.description}" ${i.quantity}`);
  const total = input.items.reduce((sum, i) => sum + i.quantity, 0);
  const text = [
    ...lines,
    "",
    `ITEMS TRACKED ${input.items.length}`,
    `TOTAL UNITS ${total}`,
    "",
  ].join("\n");
  try {
    await mkdir(input.outDir, { recursive: true });
    await writeFile(file, text);
    return { file, exitCode: EXIT_OK };
  } catch (error) {
    console.error(`inventory report ${file} failed:`, error);
    return { file, exitCode: EXIT_ERROR };
  }
}
