import { defineHandler, getCookie } from "nitro/h3";

import { bannerCategory, REMEMBER_COOKIE } from "../../server/customer/auth";
import { sharedSessions } from "../../server/localization/sessions";
import { cartFor } from "../../server/cart/store";
import { getCustomer } from "../../server/customer/repository";

// The session: locale, sign-on state, the signed-on customer's preferences and the cart's line count.
export default defineHandler(async (event) => {
  const userName = event.context.userName as string | undefined;
  const profile = userName ? (await getCustomer(userName))?.profile : undefined;
  // The session's own locale, not a per-request ?locale= override.
  const { locale } = await sharedSessions().session(event.context.sessionId as string);
  return {
    locale,
    signedOn: userName !== undefined,
    userName,
    cartCount: cartFor(event.context.sessionId as string).count(),
    rememberedUserName: getCookie(event, REMEMBER_COOKIE) || undefined,
    myList: profile?.myList,
    favoriteCategory: profile?.favoriteCategory || undefined,
    banner: profile?.banner,
    bannerCategory: profile ? bannerCategory(profile.favoriteCategory) : undefined,
  };
});
