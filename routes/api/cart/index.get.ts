import { defineHandler } from "nitro/h3";

import { cartView } from "../../../server/cart/lines";
import { cartFor } from "../../../server/cart/store";
import { localeOf } from "../../../server/catalog/http";

// The session cart with catalog-priced lines. Open to every shopper (R-0143).
export default defineHandler((event) =>
  cartView(cartFor(event.context.sessionId as string), localeOf(event)),
);
