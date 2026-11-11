import { createError, defineHandler, readBody } from "nitro/h3";

import { db } from "../../../db/client";
import { replaceCatalog, type CatalogSeed } from "../../../db/catalog-seed";

// Test support: replaces the catalog with the posted rows (design C7). Not
// available in production.
export default defineHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const body = (await readBody(event)) as Partial<CatalogSeed> | undefined;
  replaceCatalog(db, {
    categories: body?.categories ?? [],
    products: body?.products ?? [],
    items: body?.items ?? [],
    inventory: body?.inventory ?? [],
  });
  return { ok: true };
});
