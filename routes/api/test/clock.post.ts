import { createError, defineHandler, readBody } from "nitro/h3";

import { advanceClock } from "../../../server/customer/auth";

// Test support: moves the calling session's clock forward so idle-expiry cases need no sleeping
// (design A6). Per session, so parallel browser tests never expire each other. Not available in production.
export default defineHandler(async (event) => {
  if (process.env.NODE_ENV === "production") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }
  const body = (await readBody<{ advanceMinutes?: unknown }>(event).catch(() => undefined)) ?? {};
  const minutes = Number(body.advanceMinutes);
  if (!Number.isFinite(minutes)) {
    throw createError({ statusCode: 400, statusMessage: "advanceMinutes must be a number" });
  }
  advanceClock(event.context.sessionId as string, minutes);
  return { ok: true };
});
