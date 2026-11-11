import { defineHandler, getRouterParam } from "nitro/h3";

import { catalog } from "../../../../server/catalog";
import { guard, localeOf, notFound, pageOf } from "../../../../server/catalog/http";

// One category and a page of its products.
export default defineHandler((event) =>
  guard(async () => {
    const id = getRouterParam(event, "id") ?? "";
    const locale = localeOf(event);
    const category = await catalog.getCategory(id, locale);
    if (!category) throw notFound("Category");
    return { category, products: await catalog.listProducts(id, locale, pageOf(event)) };
  }),
);
