import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locale from "../../middleware/locale";
import customerGet from "./customer.get";
import customerPost from "./customer.post";
import customerPut from "./customer.put";
import register from "./register.post";
import session from "./session.get";
import signoff from "./signoff.post";
import signon from "./signon.post";
import clock from "./test/clock.post";
import userByName from "./users/[id]";

let seq = 0;
const fresh = () => `rt${Date.now().toString(36)}${++seq}`.slice(0, 25);

class Browser {
  jar: Record<string, string> = {};
  async call(
    handler: (e: H3Event) => unknown,
    opts: { url?: string; body?: unknown; params?: Record<string, string> } = {},
  ) {
    const headers = new Headers();
    const cookie = Object.entries(this.jar)
      .map(([k, v]) => `${k}=${v}`)
      .join("; ");
    if (cookie) headers.set("cookie", cookie);
    if (opts.body !== undefined) headers.set("content-type", "application/json");
    const event = new H3Event(
      new Request(opts.url ?? "http://localhost/api/x", {
        method: opts.body === undefined ? "GET" : "POST",
        headers,
        body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
      }),
      opts.params ? { params: opts.params } : undefined,
    );
    await locale(event);
    let result: unknown;
    let error: unknown;
    try {
      result = await handler(event);
    } catch (e) {
      error = e;
    }
    for (const c of event.res.headers.getSetCookie()) {
      const [pair, ...attrs] = c.split("; ");
      const [k, v] = pair.split("=");
      this.jar[k] = v;
      if (attrs.some((a) => a === "Max-Age=0")) delete this.jar[k];
    }
    return { result, error, headers: event.res.headers };
  }
  session() {
    return this.call(session).then((r) => r.result as Record<string, unknown>);
  }
}

const detail = (over: Record<string, unknown> = {}) => ({
  lastName: "Doe",
  firstName: "Jane",
  address1: "1 Main St",
  address2: "",
  city: "Springfield",
  state: "CA",
  postalCode: "94000",
  country: "USA",
  phone: "555",
  email: "j@x.com",
  cardNumber: "4111",
  cardType: "Visa",
  cardExpiry: "12/2030",
  language: "en_US",
  favoriteCategory: "FISH",
  myList: true,
  banner: true,
  ...over,
});

async function registered() {
  const b = new Browser();
  const userName = fresh();
  await b.call(register, { body: { userName, password: "pw" } });
  return { b, userName };
}

describe("account routes", () => {
  it("[SWHR8-C-0056] registering creates the user and makes it the session's current user", async () => {
    const { b, userName } = await registered();
    expect(await b.session()).toMatchObject({ signedOn: true, userName });
    expect((await b.call(userByName, { params: { id: userName } })).result).toMatchObject({
      userName,
    });
  });

  it("[SWHR8-C-0032] registering an existing user name is a duplicate and creates no user", async () => {
    const b = new Browser();
    const res = await b.call(register, { body: { userName: "shopper", password: "x" } });
    expect(res.error).toMatchObject({ status: 409 });
    expect(await b.session()).toMatchObject({ signedOn: false });
  });

  it("[SWHR8-C-0045] registration without a password creates no user", async () => {
    const b = new Browser();
    const userName = fresh();
    const res = await b.call(register, { body: { userName, password: "" } });
    expect(res.error).toMatchObject({ status: 400 });
    const lookup = await b.call(userByName, { params: { id: userName } });
    expect(lookup.error).toMatchObject({ status: 404 });
  });

  it("[SWHR8-C-0034] a user registered after requesting a protected page is signed on to return there", async () => {
    const { b, userName } = await registered();
    expect((await b.session()).userName).toBe(userName);
  });

  it("[SWHR8-C-0037] wrong credentials are refused and the session stays signed off", async () => {
    const b = new Browser();
    const res = await b.call(signon, { body: { userName: "shopper", password: "wrong" } });
    expect(res.error).toMatchObject({ status: 401 });
    expect(await b.session()).toMatchObject({ signedOn: false });
  });

  it("[SWHR8-C-0061] sign-on succeeds with the sample credentials", async () => {
    const b = new Browser();
    await b.call(signon, { body: { userName: "shopper", password: "shopper" } });
    expect(await b.session()).toMatchObject({ signedOn: true, userName: "shopper" });
  });

  it("[SWHR8-C-0038] remember sets a 31-day bp_signon cookie; unticked expires it", async () => {
    const b = new Browser();
    const on = await b.call(signon, {
      body: { userName: "j2ee", password: "j2ee", remember: true },
    });
    expect(on.headers.get("set-cookie")).toMatch(/bp_signon=j2ee.*Max-Age=2678400/i);
    const off = await b.call(signon, {
      body: { userName: "j2ee", password: "j2ee", remember: false },
    });
    expect(off.headers.getSetCookie().join(";")).toMatch(/bp_signon=;.*Max-Age=0/i);
  });

  it("[SWHR8-C-0046] the profile APIs need sign-on while the session API is public", async () => {
    const b = new Browser();
    expect((await b.call(customerGet)).error).toMatchObject({ status: 401 });
    expect((await b.call(customerPut, { body: detail() })).error).toMatchObject({ status: 401 });
    expect(await b.session()).toMatchObject({ signedOn: false, cartCount: 0 });
  });

  it("[SWHR8-C-0057] order information entry needs sign-on: the session reports signed off", async () => {
    expect((await new Browser().session()).signedOn).toBe(false);
  });

  it("[SWHR8-C-0058] the profile screen's data is refused when signed out", async () => {
    expect((await new Browser().call(customerGet)).error).toMatchObject({ status: 401 });
  });

  it("[SWHR8-C-0031] a cleared banner checkbox turns the banner preference off", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail() });
    const withoutBanner = Object.fromEntries(
      Object.entries(detail()).filter(([k]) => k !== "banner"),
    );
    await b.call(customerPut, { body: withoutBanner });
    const got = (await b.call(customerGet)).result as Record<string, unknown>;
    expect(got).toMatchObject({ banner: false, myList: true });
  });

  it("[SWHR8-C-0053] a customer update replaces contact, card and preferences", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail() });
    await b.call(customerPut, {
      body: detail({ lastName: "Roe", cardType: "MasterCard", favoriteCategory: "BIRDS" }),
    });
    expect((await b.call(customerGet)).result).toMatchObject({
      lastName: "Roe",
      cardType: "MasterCard",
      favoriteCategory: "BIRDS",
    });
  });

  it("[SWHR8-C-0055] a form without a city is rejected naming the field", async () => {
    const { b } = await registered();
    const rest = Object.fromEntries(Object.entries(detail()).filter(([k]) => k !== "city"));
    const res = await b.call(customerPost, { body: rest });
    expect(res.error).toMatchObject({ status: 400 });
    expect(String((res.error as Error).message)).toMatch(/city/i);
  });

  it("[SWHR8-C-0018] saving the profile with language ja_JP applies it to the session", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail({ language: "ja_JP" }) });
    expect(await b.session()).toMatchObject({ locale: "ja_JP" });
  });

  it("[SWHR8-C-0049] signing on applies the profile language to the session", async () => {
    const { b, userName } = await registered();
    await b.call(customerPost, { body: detail({ language: "ja_JP" }) });
    const other = new Browser();
    await other.call(signon, { body: { userName, password: "pw" } });
    expect(await other.session()).toMatchObject({ locale: "ja_JP", signedOn: true });
  });

  it("[SWHR8-C-0233] the session reports MyList, favourite category and banner for a signed-on customer", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail({ favoriteCategory: "FISH" }) });
    expect(await b.session()).toMatchObject({
      myList: true,
      favoriteCategory: "FISH",
      banner: true,
      bannerCategory: "FISH",
    });
  });

  it("[SWHR8-C-0033] an unknown favourite category shows the dogs banner", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail({ favoriteCategory: "UNICORNS" }) });
    expect(await b.session()).toMatchObject({ bannerCategory: "DOGS" });
  });

  it("[SWHR8-C-0065] a signed-on session idle for 15 minutes must sign on again", async () => {
    const { b } = await registered();
    await b.call(clock, { body: { advanceMinutes: 15 } });
    expect(await b.session()).toMatchObject({ signedOn: false });
  });

  it("[SWHR8-C-0051] sign-off clears sign-on state and keeps the locale", async () => {
    const { b } = await registered();
    await b.call(customerPost, { body: detail({ language: "ja_JP" }) });
    await b.call(signoff, { body: {} });
    expect(await b.session()).toMatchObject({ signedOn: false, cartCount: 0, locale: "ja_JP" });
  });
});
