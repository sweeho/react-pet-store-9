import { defineHandler } from "nitro/h3";

import { sharedAuth } from "../../server/customer/auth";

// Clears the sign-on state (and the cart slot, once the cart exists); the locale is kept.
export default defineHandler((event) => {
  sharedAuth().signOff(event.context.sessionId as string);
  event.context.userName = undefined;
  return { signedOn: false };
});
