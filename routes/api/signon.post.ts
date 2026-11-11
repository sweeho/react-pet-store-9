import { defineHandler, HTTPError, readBody, setCookie } from "nitro/h3";

import { sharedAuth } from "../../server/customer/auth";
import { now } from "../../server/customer/http";
import { getCustomer } from "../../server/customer/repository";

// Signs the session on. Wrong credentials are a 401 and leave the session as it was.
export default defineHandler(async (event) => {
  const body = (await readBody<Record<string, unknown>>(event).catch(() => undefined)) ?? {};
  const cookies = Object.fromEntries(
    (event.req.headers.get("cookie") ?? "")
      .split(/;\s*/)
      .filter(Boolean)
      .map((pair) => [pair.slice(0, pair.indexOf("=")), pair.slice(pair.indexOf("=") + 1)]),
  );
  const result = await sharedAuth().signOn(
    event.context.sessionId as string,
    {
      userName: typeof body.userName === "string" ? body.userName.trim() : undefined,
      password: typeof body.password === "string" ? body.password : undefined,
      remember: body.remember === true,
      cookies,
    },
    now(event),
  );
  if (!result.signedOn) throw new HTTPError({ status: 401, message: "Sign on failed" });
  if (result.cookie) {
    setCookie(event, result.cookie.name, result.cookie.value, {
      maxAge: result.cookie.maxAge,
      sameSite: "lax",
      path: "/",
    });
  }
  const userName = String(body.userName).trim();
  const customer = await getCustomer(userName);
  return { signedOn: true, userName, hasCustomer: customer !== undefined };
});
