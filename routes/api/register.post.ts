import { defineHandler, HTTPError, readBody } from "nitro/h3";

import { sharedAuth } from "../../server/customer/auth";
import { now } from "../../server/customer/http";

// Creates a sign-on user and makes it the session's current user. An existing name is a 409
// (the duplicate-account screen); a missing or invalid name or password is a 400 and creates nothing.
export default defineHandler(async (event) => {
  const body = (await readBody<Record<string, unknown>>(event).catch(() => undefined)) ?? {};
  const result = await sharedAuth().register(
    event.context.sessionId as string,
    {
      userName: typeof body.userName === "string" ? body.userName.trim() : undefined,
      password: typeof body.password === "string" ? body.password : undefined,
    },
    now(event),
  );
  if (result.duplicate) throw new HTTPError({ status: 409, message: "Duplicate account" });
  if (!result.created) throw new HTTPError({ status: 400, message: result.error ?? "Invalid" });
  return { created: true, userName: String(body.userName).trim() };
});
