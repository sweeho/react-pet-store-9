import { defineHandler, getRouterParam } from "nitro/h3";

import { catalog } from "../../../../server/catalog";
import { guard, localeOf, notFound, pageOf } from "../../../../server/catalog/http";

// One product and a page of its items.
export default defineHandler((event) =>
  guard(async () => {
    const id = getRouterParam(event, "id") ?? "";
    const locale = localeOf(event);
    const product = await catalog.getProduct(id, locale);
    if (!product) throw notFound("Product");
    return { product, items: await catalog.listItems(id, locale, pageOf(event)) };
  }),
);
