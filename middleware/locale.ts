import { defineHandler, getCookie, setCookie } from "nitro/h3";

import { clockFor, sharedAuth } from "../server/customer/auth";
import { sharedSessions } from "../server/localization/sessions";

export const SESSION_COOKIE = "petstore_sid";

/**
 * Resolves or creates the session on every request (design L4), applies the
 * default locale, and exposes `sessionId` and `locale` on the event context.
 * A `?locale=` parameter overrides the locale for this request only. The
 * session's sign-on state rides on the same cookie (customer design A4):
 * `userName` is set when the session is signed on and not idle for 15 minutes.
 */
export default defineHandler(async (event) => {
  const url = new URL(event.req.url);
  const cookie = getCookie(event, SESSION_COOKIE);
  const now = clockFor(cookie);
  const res = await sharedSessions().request(
    cookie ?? "",
    { params: { locale: url.searchParams.get("locale") ?? undefined } },
    now,
  );
  if (res.sessionId !== cookie) {
    setCookie(event, SESSION_COOKIE, res.sessionId, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });
  }
  event.context.sessionId = res.sessionId;
  event.context.locale = res.locale;
  event.context.userName = (await sharedAuth().session(res.sessionId, now)).userName;
});
