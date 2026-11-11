import { defineHandler } from "nitro/h3";

import { catalog } from "../../../server/catalog";
import { CATALOG_PAGE_SIZE, paginate } from "../../../server/catalog/catalog";
import { guard, localeOf, pageOf } from "../../../server/catalog/http";

// A page of categories in the session locale, ordered by name.
export default defineHandler((event) =>
  guard(async () => {
    const { start, count } = pageOf(event);
    const all = await catalog.listCategories(localeOf(event));
    return paginate(all, start, count ?? CATALOG_PAGE_SIZE);
  }),
);
