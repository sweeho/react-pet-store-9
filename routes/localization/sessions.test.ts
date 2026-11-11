import { describe, expect, it } from "vitest";

import { createLocaleSessions } from "./sessions";

const T0 = new Date("2026-01-01T10:00:00Z");
const at = (minutes: number) => new Date(T0.getTime() + minutes * 60_000);

async function setup(defaultLocale = "en_US") {
  const sessions = createLocaleSessions({ defaultLocale, timeoutMinutes: 30 });
  const id = await sessions.start(T0);
  return { sessions, id };
}

describe("default session locale", () => {
  it("[SWHR8-C-0010] a session with no locale becomes en_US when a request is processed", async () => {
    const { sessions, id } = await setup();
    expect((await sessions.session(id)).locale).toBeUndefined();
    const res = await sessions.request(id, {}, T0);
    expect(res).toMatchObject({ sessionId: id, isNew: false, locale: "en_US" });
    expect((await sessions.session(id)).locale).toBe("en_US");
  });

  it("[SWHR8-C-0010] an unknown session id starts a new session with the default locale", async () => {
    const { sessions } = await setup();
    const res = await sessions.request("no-such-session", {}, T0);
    expect(res.isNew).toBe(true);
    expect(res.locale).toBe("en_US");
    expect(res.sessionId).not.toBe("no-such-session");
  });
});

describe("changing the locale", () => {
  it('[SWHR8-C-0007] "english" is rejected and the session stays en_US', async () => {
    const { sessions, id } = await setup();
    await sessions.request(id, {}, T0);
    await expect(sessions.changeLocale(id, "english", T0)).rejects.toThrow(/unable to change/i);
    expect((await sessions.session(id)).locale).toBe("en_US");
  });

  it("[SWHR8-C-0008] a missing code is rejected and the session stays ja_JP", async () => {
    const { sessions, id } = await setup();
    await sessions.changeLocale(id, "ja_JP", T0);
    await expect(sessions.changeLocale(id, undefined, T0)).rejects.toThrow(/unable to change/i);
    expect((await sessions.session(id)).locale).toBe("ja_JP");
  });

  it("[SWHR8-C-0009] after ja_JP is submitted a later request uses ja_JP", async () => {
    const { sessions, id } = await setup();
    await sessions.request(id, {}, T0);
    await sessions.changeLocale(id, "ja_JP", at(1));
    const later = await sessions.request(id, {}, at(2));
    expect(later.isNew).toBe(false);
    expect(later.locale).toBe("ja_JP");
  });

  it("[SWHR8-C-0009] a locale without screens such as de_DE is accepted", async () => {
    const { sessions, id } = await setup();
    expect(await sessions.changeLocale(id, "de_DE", T0)).toEqual({ locale: "de_DE" });
  });

  it('[SWHR8-C-0025] "default" selects the server default locale', async () => {
    const { sessions, id } = await setup("zh_CN");
    await sessions.changeLocale(id, "ja_JP", T0);
    const changed = await sessions.changeLocale(id, "default", at(1));
    expect(changed.locale).toBe("zh_CN");
    expect((await sessions.session(id)).locale).toBe("zh_CN");
  });

  it("[SWHR8-C-0009] an unknown session cannot be changed", async () => {
    const { sessions } = await setup();
    await expect(sessions.changeLocale("nope", "ja_JP", T0)).rejects.toThrow(/unable to change/i);
  });
});

describe("request parameter", () => {
  it("[SWHR8-C-0011] a locale parameter applies to that request only", async () => {
    const { sessions, id } = await setup();
    await sessions.changeLocale(id, "en_US", T0);
    const withParam = await sessions.request(id, { params: { locale: "ja_JP" } }, at(1));
    expect(withParam.locale).toBe("ja_JP");
    expect((await sessions.session(id)).locale).toBe("en_US");
    expect((await sessions.request(id, {}, at(2))).locale).toBe("en_US");
  });

  it("[SWHR8-C-0011] an unparseable parameter is ignored", async () => {
    const { sessions, id } = await setup();
    const res = await sessions.request(id, { params: { locale: "english" } }, T0);
    expect(res.locale).toBe("en_US");
  });
});

describe("inactivity timeout", () => {
  it("[SWHR8-C-0027] a session idle for 30 minutes is replaced by a new one with the default locale", async () => {
    const { sessions, id } = await setup();
    await sessions.changeLocale(id, "ja_JP", T0);
    const res = await sessions.request(id, {}, at(30));
    expect(res.isNew).toBe(true);
    expect(res.sessionId).not.toBe(id);
    expect(res.locale).toBe("en_US");
  });

  it("[SWHR8-C-0027] activity inside the window keeps the session", async () => {
    const { sessions, id } = await setup();
    await sessions.changeLocale(id, "ja_JP", T0);
    await sessions.request(id, {}, at(20));
    const res = await sessions.request(id, {}, at(40));
    expect(res.isNew).toBe(false);
    expect(res.locale).toBe("ja_JP");
  });
});

describe("preferred language", () => {
  it("[SWHR8-C-0009] a profile save calls changeLocale and later pages use that locale", async () => {
    // Customer account (SWHR8-I-0005) saves the preferred language through this call.
    const { sessions, id } = await setup();
    await sessions.changeLocale(id, "ja_JP", at(1));
    expect((await sessions.request(id, {}, at(2))).locale).toBe("ja_JP");
  });
});
