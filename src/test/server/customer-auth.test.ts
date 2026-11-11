// @vitest-environment node
import { describe, expect, it } from "vitest";

import { bannerFor, createAuth, rememberedUserName } from "../../../server/customer/auth";
import * as repo from "../../../server/customer/repository";

const T0 = new Date("2026-01-01T10:00:00Z");
const later = (m: number) => new Date(T0.getTime() + m * 60_000);
let seq = 0;
const uname = () => `a${Date.now().toString(36)}${++seq}`.slice(0, 25);
const formWith = (over: Record<string, unknown>) => ({
  lastName: "D",
  firstName: "J",
  address1: "1",
  city: "C",
  state: "S",
  postalCode: "9",
  country: "US",
  phone: "5",
  email: "e@x.com",
  cardNumber: "1",
  cardType: "Visa",
  cardExpiry: "1",
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});
async function signedOn(over: Record<string, unknown> = {}) {
  const a = createAuth();
  const userName = uname();
  await repo.saveSignOnUser({ userName, password: "pw" });
  await repo.createCustomer({ userName });
  if (Object.keys(over).length) await repo.updateCustomer(userName, formWith(over));
  const id = await a.start(T0);
  await a.signOn(id, { userName, password: "pw" }, T0);
  return { a, id, userName };
}

describe("customer auth", () => {
  it("[SWHR8-C-0033] the banner follows the favourite category, with dogs for an unknown one", () => {
    expect(bannerFor({ banner: true, favoriteCategory: "FISH" })).toMatch(/fish/i);
    expect(bannerFor({ banner: true, favoriteCategory: "UNICORNS" })).toMatch(/dogs/i);
  });
  it("[SWHR8-C-0038] remember sets a 31-day cookie; unticked expires an existing one", async () => {
    const { a, userName } = await signedOn();
    const s1 = await a.start(T0);
    expect((await a.signOn(s1, { userName, password: "pw", remember: true }, T0)).cookie).toEqual({
      name: "bp_signon",
      value: userName,
      maxAge: 2678400,
    });
    const s2 = await a.start(T0);
    const off = await a.signOn(
      s2,
      { userName, password: "pw", remember: false, cookies: { bp_signon: userName } },
      T0,
    );
    expect(off.cookie).toMatchObject({ name: "bp_signon", maxAge: 0 });
  });
  it("[SWHR8-C-0048] the remembered user name is read from the bp_signon cookie", () => {
    expect(rememberedUserName({ bp_signon: "shopper" })).toBe("shopper");
  });
  it("[SWHR8-C-0049] sign-on applies the preferred language to session and cart", async () => {
    const { a, id } = await signedOn({ language: "ja_JP" });
    expect(await a.session(id, T0)).toMatchObject({ locale: "ja_JP", cartLocale: "ja_JP" });
  });
  it("[SWHR8-C-0051] a signed-on session idle for 15 minutes is signed off", async () => {
    const { a, id } = await signedOn();
    expect((await a.session(id, later(14))).signedOn).toBe(true);
    expect((await a.session(id, later(30))).signedOn).toBe(false);
  });
  it("[SWHR8-C-0052] a session idle for 15 minutes has ended", async () => {
    const a = createAuth();
    const id = await a.start(T0);
    expect((await a.session(id, later(15))).active).toBe(false);
  });
  it("[SWHR8-C-0054] an idle session expires after 15 minutes", async () => {
    const a = createAuth();
    const id = await a.start(T0);
    expect((await a.session(id, later(14))).active).toBe(true);
    expect((await a.session(id, later(29))).active).toBe(false);
  });
  it("[SWHR8-C-0056] a valid creation makes the new user the session's current user", async () => {
    const a = createAuth();
    const id = await a.start(T0);
    const userName = uname();
    expect(await a.register(id, { userName, password: "pw" }, T0)).toMatchObject({ created: true });
    expect(await repo.getSignOnUser(userName)).toBeDefined();
    expect((await a.session(id, T0)).userName).toBe(userName);
  });
});
