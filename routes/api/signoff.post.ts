import { defineHandler } from "nitro/h3";

import { adminSignOff } from "../../server/admin/auth";
import { dropCart } from "../../server/cart/store";
import { sharedAuth } from "../../server/customer/auth";

// Clears the sign-on state and the cart; the locale is kept.
export default defineHandler((event) => {
  sharedAuth().signOff(event.context.sessionId as string);
  adminSignOff(event.context.sessionId as string);
  dropCart(event.context.sessionId as string);
  event.context.userName = undefined;
  return { signedOn: false };
});
