// Runs the catalog consistency check against sqlite.db and exits with its code
// (design C6): `bun run catalog:check`. Scheduling it is out of scope.
import { db } from "../db/client";
import { category, categoryDetails, inventory, item, itemDetails, product } from "../db/schema";
import { runCatalogCheck, type CatalogSnapshot } from "../server/jobs/catalog-check";

function snapshot(): CatalogSnapshot {
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

const { exitCode, log } = await runCatalogCheck({
  catalog: snapshot(),
  // Populating on demand is SWHR8-I-0013's; the tables always exist here.
  populate: async () => false,
});
for (const line of log) console.log(line);
console.log(exitCode === 0 ? "Catalog check passed" : `Catalog check failed (exit ${exitCode})`);
process.exit(exitCode);
