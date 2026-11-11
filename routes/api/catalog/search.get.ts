import { defineHandler, getQuery } from "nitro/h3";

import { catalog } from "../../../server/catalog";
import { guard, localeOf, pageOf } from "../../../server/catalog/http";

// Items matching any word of `?q=`; a blank query is an empty page.
export default defineHandler((event) =>
  guard(async () => {
    const locale = localeOf(event);
    const q = String(getQuery(event).q ?? "");
    const page = await catalog.searchItems(q, locale, pageOf(event));
    const products = new Map();
    const rows = [];
    for (const item of page.rows) {
      if (!products.has(item.productId)) {
        products.set(item.productId, await catalog.getProduct(item.productId, locale));
      }
      const parent = products.get(item.productId);
      rows.push({ ...item, productName: parent?.name ?? "", categoryId: parent?.categoryId ?? "" });
    }
    return { ...page, rows };
  }),
);
