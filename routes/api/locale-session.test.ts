import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locale from "../../middleware/locale";
import changeLocale from "./locale.post";
import session from "./session.get";

/** Runs the middleware, then the handler, carrying the cookie like a browser. */
async function call(
  handler: (event: H3Event) => unknown,
  opts: { cookie?: string; url?: string; body?: unknown } = {},
) {
  const headers = new Headers();
  if (opts.cookie) headers.set("cookie", opts.cookie);
  if (opts.body !== undefined) headers.set("content-type", "application/json");
  const event = new H3Event(
    new Request(opts.url ?? "http://localhost/api/session", {
      method: opts.body === undefined ? "GET" : "POST",
      headers,
      body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
    }),
  );
  await locale(event);
  const setCookie = event.res.headers.get("set-cookie");
  const sid = setCookie?.match(/petstore_sid=([^;]+)/)?.[1];
  let result: unknown;
  let error: unknown;
  try {
    result = await handler(event);
  } catch (e) {
    error = e;
  }
  return { event, sid, result, error };
}

describe("session middleware and locale endpoints", () => {
  it("[SWHR8-C-0010] a new session gets a cookie and the en_US locale", async () => {
    const first = await call(session);
    expect(first.sid).toBeTruthy();
    expect(first.event.res.headers.get("set-cookie")).toMatch(/HttpOnly/i);
    expect(first.result).toEqual({ locale: "en_US" });
    expect(first.event.context.locale).toBe("en_US");
  });

  it("[SWHR8-C-0009] a valid change applies to later requests in the same session", async () => {
    const { sid } = await call(session);
    const cookie = `petstore_sid=${sid}`;
    const changed = await call(changeLocale, { cookie, body: { locale: "ja_JP" } });
    expect(changed.result).toEqual({ locale: "ja_JP" });
    const later = await call(session, { cookie });
    expect(later.result).toEqual({ locale: "ja_JP" });
    expect(later.sid).toBeUndefined();
  });

  it("[SWHR8-C-0007] an unparseable code is a 400 and the session locale is unchanged", async () => {
    const { sid } = await call(session);
    const cookie = `petstore_sid=${sid}`;
    const bad = await call(changeLocale, { cookie, body: { locale: "english" } });
    expect(bad.error).toMatchObject({ status: 400, message: "Unable to change the language" });
    expect((await call(session, { cookie })).result).toEqual({ locale: "en_US" });
  });

  it("[SWHR8-C-0008] a missing code is a 400 and the session locale is unchanged", async () => {
    const { sid } = await call(session);
    const cookie = `petstore_sid=${sid}`;
    await call(changeLocale, { cookie, body: { locale: "ja_JP" } });
    const bad = await call(changeLocale, { cookie, body: {} });
    expect(bad.error).toMatchObject({ status: 400 });
    expect((await call(session, { cookie })).result).toEqual({ locale: "ja_JP" });
  });

  it("[SWHR8-C-0025] the code default selects the server default locale", async () => {
    const { sid } = await call(session);
    const cookie = `petstore_sid=${sid}`;
    await call(changeLocale, { cookie, body: { locale: "ja_JP" } });
    const res = await call(changeLocale, { cookie, body: { locale: "default" } });
    expect(res.result).toEqual({ locale: "en_US" });
  });

  it("[SWHR8-C-0011] a ?locale= parameter overrides the locale for that request only", async () => {
    const { sid } = await call(session);
    const cookie = `petstore_sid=${sid}`;
    const overridden = await call(session, {
      cookie,
      url: "http://localhost/api/session?locale=ja_JP",
    });
    expect(overridden.event.context.locale).toBe("ja_JP");
    expect(overridden.result).toEqual({ locale: "en_US" });
  });

  it("[SWHR8-C-0027] an unknown session cookie is replaced by a new session", async () => {
    const res = await call(session, { cookie: "petstore_sid=expired" });
    expect(res.sid).toBeTruthy();
    expect(res.sid).not.toBe("expired");
  });
});
