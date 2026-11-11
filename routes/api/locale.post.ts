import { defineHandler, HTTPError, readBody } from "nitro/h3";

import { CHANGE_ERROR, sharedSessions } from "../../server/localization/sessions";

// Changes the session locale. An unparseable or missing code is a 400 and leaves it unchanged.
export default defineHandler(async (event) => {
  const body = await readBody<{ locale?: string }>(event).catch(() => undefined);
  try {
    return await sharedSessions().changeLocale(
      event.context.sessionId as string,
      typeof body?.locale === "string" ? body.locale : undefined,
      new Date(),
    );
  } catch {
    throw new HTTPError({ status: 400, message: CHANGE_ERROR });
  }
});
