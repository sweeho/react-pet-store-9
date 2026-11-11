import { createError, defineHandler, readBody } from "nitro/h3";

import { db } from "../../../db/client";
import { upsertCatalog, type CatalogSeed } from "../../../db/catalog-seed";

// Test support: adds the posted rows to the catalog, replacing rows with the same key (design C7, upsert so parallel browser tests do not wipe each other). Not
// available in production.
export default defineHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const body = (await readBody(event)) as Partial<CatalogSeed> | undefined;
  const rows = [body?.categories, body?.products, body?.items, body?.inventory];
  if (rows.some((r) => r !== undefined && !Array.isArray(r))) {
    throw createError({ statusCode: 400, statusMessage: "Each field must be an array" });
  }
  upsertCatalog(db, {
    categories: body?.categories ?? [],
    products: body?.products ?? [],
    items: body?.items ?? [],
    inventory: body?.inventory ?? [],
  });
  return { ok: true };
});
