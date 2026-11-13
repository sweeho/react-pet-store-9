import { defineHandler, HTTPError, readBody } from "nitro/h3";

import { adminSignOn } from "../../../server/admin/auth";

// Form login for administration. Wrong credentials are a 401; a valid non-administrator is signed in
// and told so (`isAdministrator: false`), and is refused by the admin resources themselves.
export default defineHandler(async (event) => {
  const body = (await readBody<Record<string, unknown>>(event).catch(() => undefined)) ?? {};
  const userName = typeof body.userName === "string" ? body.userName.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const session = await adminSignOn(event.context.sessionId as string, userName, password);
  if (!session) throw new HTTPError({ status: 401, message: "Sign in failed" });
  return session;
});
