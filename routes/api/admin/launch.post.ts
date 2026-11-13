import { defineHandler, getRequestURL, readBody, setResponseHeader } from "nitro/h3";

import { adminSignOff, requireAdministrator } from "../../../server/admin/auth";
import { handleAdminAction } from "../../../server/lib/admin-launcher";

// The administration launcher: `manageorders` -> launch descriptor, `logout` -> signs off, else empty.
// The descriptor carries the session id, so it is never cached (design SD5).
export default defineHandler(async (event) => {
  requireAdministrator(event);
  setResponseHeader(event, "Cache-Control", "no-store");
  const body = (await readBody<{ action?: unknown }>(event).catch(() => undefined)) ?? {};
  const sessionId = event.context.sessionId as string;
  const url = getRequestURL(event);
  const result = handleAdminAction({
    action: typeof body.action === "string" ? body.action : undefined,
    session: { id: sessionId },
    host: url.hostname,
    port: Number(url.port) || (url.protocol === "https:" ? 443 : 80),
  });
  if (result.kind === "logout-page") adminSignOff(sessionId);
  return result;
});
