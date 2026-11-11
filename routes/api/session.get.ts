import { defineHandler } from "nitro/h3";

import { sharedSessions } from "../../server/localization/sessions";

// The session locale. Later capabilities add fields to this response.
export default defineHandler(async (event) => {
  const { locale } = await sharedSessions().session(event.context.sessionId as string);
  return { locale };
});
