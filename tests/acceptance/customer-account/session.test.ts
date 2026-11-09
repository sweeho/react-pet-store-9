// @vitest-environment node
import { describe, expect, it } from "vitest";
import { form, later, T0, uname } from "./helpers";

// Assumed module boundary (the clock is passed in, never slept on): server/customer/auth.ts exports
//   createAuth() -> auth, an in-memory session store over the customer repository, with (all async)
//     auth.start(now) -> sessionId               a new anonymous session, locale "en_US"
//     auth.signOn(sessionId, { userName, password, remember?, cookies? }, now)
//        -> { signedOn: boolean, cookie: null | { name, value, maxAge } }
//        cookie is { name: "bp_signon", value: userName, maxAge: 2678400 } when remember is ticked, and
//        { name: "bp_signon", value: "", maxAge: 0 } (expired) when unticked while cookies has bp_signon
//     auth.register(sessionId, { userName, password }, now) -> { created: boolean }  the new user becomes current
//     auth.session(sessionId, now) -> { active, signedOn, userName?, locale, cartLocale }
//        any call counts as the customer acting; a session idle for 15 minutes (900000 ms) or more is
//        { active: false, signedOn: false }
//   rememberedUserName(cookies: Record<string,string>) -> string | undefined   reads the bp_signon cookie
//   bannerFor(profile: { banner, favoriteCategory }) -> string   image path/name of the banner, dogs for unknown
const auth = () => import("../../../server/customer/auth");
const repo = () => import("../../../server/customer/repository");

async function customer(over: Record<string, unknown> = {}) {
  const r = await repo();
  const userName = uname("s");
  await r.saveSignOnUser({ userName, password: "pw" });
  await r.createCustomer({ userName });
  if (Object.keys(over).length) await r.updateCustomer(userName, form(over));
  return userName;
}

async function signedOn(over: Record<string, unknown> = {}) {
  const { createAuth } = await auth();
  const a = createAuth();
  const userName = await customer(over);
  const id = await a.start(T0);
  await a.signOn(id, { userName, password: "pw" }, T0);
  return { a, id, userName };
}

describe("customer sessions", () => {
  // case: SWHR8-C-0033@v1
  it("[SWHR8-C-0033] the banner follows the favourite category, with dogs for an unknown one", async () => {
    const { bannerFor } = await auth();
    expect(bannerFor({ banner: true, favoriteCategory: "FISH" })).toMatch(/fish/i);
    expect(bannerFor({ banner: true, favoriteCategory: "UNICORNS" })).toMatch(/dogs/i);
  });

  // case: SWHR8-C-0038@v1
  it("[SWHR8-C-0038] remember sets a 31-day cookie with the user name; unticked expires an existing cookie", async () => {
    const { a, userName } = await signedOn();
    const s1 = await a.start(T0);
    const on = await a.signOn(s1, { userName, password: "pw", remember: true }, T0);
    expect(on.cookie).toEqual({ name: "bp_signon", value: userName, maxAge: 2678400 });
    const s2 = await a.start(T0);
    const off = await a.signOn(
      s2,
      { userName, password: "pw", remember: false, cookies: { bp_signon: userName } },
      T0,
    );
    expect(off.cookie).toMatchObject({ name: "bp_signon", maxAge: 0 });
  });

  // case: SWHR8-C-0048@v1
  it("[SWHR8-C-0048] the remembered user name is read from the bp_signon cookie", async () => {
    const { rememberedUserName } = await auth();
    expect(rememberedUserName({ bp_signon: "shopper" })).toBe("shopper");
  });

  // case: SWHR8-C-0049@v1
  it("[SWHR8-C-0049] sign-on applies the preferred language ja_JP to session and cart", async () => {
    const { a, id } = await signedOn({ language: "ja_JP" });
    const s = await a.session(id, T0);
    expect(s.locale).toBe("ja_JP");
    expect(s.cartLocale).toBe("ja_JP");
  });

  // case: SWHR8-C-0051@v1
  it("[SWHR8-C-0051] a signed-on session idle for 15 minutes is signed off", async () => {
    const { a, id } = await signedOn();
    expect((await a.session(id, later(15))).signedOn).toBe(false);
  });

  // case: SWHR8-C-0052@v1
  it("[SWHR8-C-0052] a session idle for 15 minutes has ended", async () => {
    const { createAuth } = await auth();
    const a = createAuth();
    const id = await a.start(T0);
    expect((await a.session(id, later(15))).active).toBe(false);
  });

  // case: SWHR8-C-0054@v1
  it("[SWHR8-C-0054] an idle session expires after 15 minutes", async () => {
    const { createAuth } = await auth();
    const a = createAuth();
    const id = await a.start(T0);
    expect((await a.session(id, T0)).active).toBe(true);
    expect((await a.session(id, later(15))).active).toBe(false);
  });

  // case: SWHR8-C-0056@v1
  it("[SWHR8-C-0056] a valid creation makes the new user the session's current user", async () => {
    const { createAuth } = await auth();
    const { getSignOnUser } = (await repo()) as unknown as {
      getSignOnUser: (n: string) => Promise<unknown>;
    };
    const a = createAuth();
    const id = await a.start(T0);
    const userName = uname("n");
    const res = await a.register(id, { userName, password: "pw" }, T0);
    expect(res.created).toBe(true);
    expect(await getSignOnUser(userName)).toBeDefined();
    expect((await a.session(id, T0)).userName).toBe(userName);
  });
});
