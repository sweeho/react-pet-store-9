import { defineHandler, getRouterParam } from "nitro/h3";

import { catalog } from "../../../../server/catalog";
import { guard, localeOf, notFound } from "../../../../server/catalog/http";

// One item with its raw prices (the page formats them) and its product's name.
export default defineHandler((event) =>
  guard(async () => {
    const locale = localeOf(event);
    const item = await catalog.getItem(getRouterParam(event, "id") ?? "", locale);
    if (!item) throw notFound("Item");
    const product = await catalog.getProduct(item.productId, locale);
    return { ...item, productName: product?.name ?? "", categoryId: product?.categoryId ?? "" };
  }),
);
