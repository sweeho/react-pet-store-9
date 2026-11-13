// Runs the catalog consistency check against sqlite.db and exits with its code
// (design C6, I4): `bun run catalog:check`. PM2 runs it daily at 06:00.
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

import { db } from "../db/client";
import { category, categoryDetails, inventory, item, itemDetails, product } from "../db/schema";
import { batchSettings } from "../server/jobs/batch-settings";
import { runCatalogCheck, type CatalogSnapshot } from "../server/jobs/catalog-check";

/** Reads the catalog; `null` when the catalog tables do not exist. */
function snapshot(): CatalogSnapshot | null {
  try {
    return readSnapshot();
  } catch (error) {
    if (error instanceof Error && /no such table/i.test(`${error.message} ${error.cause}`)) {
      return null;
    }
    throw error;
  }
}

function readSnapshot(): CatalogSnapshot {
  const details = db.select().from(categoryDetails).all();
  const prices = db.select().from(itemDetails).all();
  return {
    categories: db
      .select()
      .from(category)
      .all()
      .map((c) => ({
        id: c.id,
        locales: details.filter((d) => d.categoryId === c.id).map((d) => d.locale),
      })),
    products: db.select().from(product).all(),
    items: db
      .select()
      .from(item)
      .all()
      .map((i) => {
        const rows = prices.filter((p) => p.itemId === i.id);
        return {
          id: i.id,
          productId: i.productId,
          prices: rows.map((r) => ({
            locale: r.locale,
            listPrice: r.listPrice,
            unitCost: r.unitCost,
          })),
          descriptionLocales: rows.filter((r) => r.description !== "").map((r) => r.locale),
        };
      }),
    inventoryItemIds: db
      .select()
      .from(inventory)
      .all()
      .map((r) => r.itemId),
  };
}

const settings = batchSettings();

/** Asks the storefront to load the catalog without forcing a reload; true only on HTTP 200. */
async function populate(request: { forcefully: boolean }): Promise<boolean> {
  try {
    const res = await fetch(`${settings.storeUrl}/api/populate?forcefully=${request.forcefully}`);
    return res.status === 200;
  } catch (error) {
    console.error("Populate request failed:", error);
    return false;
  }
}

const { exitCode, log } = await runCatalogCheck({
  catalog: snapshot(),
  populate,
  reload: snapshot,
});
const summary = exitCode === 0 ? "Catalog check passed" : `Catalog check failed (exit ${exitCode})`;
const lines = [...log, summary];
for (const line of lines) console.log(line);
try {
  await mkdir(settings.outDir, { recursive: true });
  await appendFile(
    path.join(settings.outDir, "catalog_check.log"),
    `${new Date().toISOString()} catalog check\n${lines.join("\n")}\n`,
  );
} catch (error) {
  console.error("Could not write catalog_check.log:", error);
}
process.exit(exitCode);
