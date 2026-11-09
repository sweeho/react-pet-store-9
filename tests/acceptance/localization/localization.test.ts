// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundaries (the legacy code is unspecified; see the change's design.md). All under server/localization/:
//   details.ts   createDetailsStore() -> store, in-memory, keyed by (entity, id, locale):
//                  store.put({ entity: "category"|"product"|"item", id, locale, name, description }) -> Promise<void>,
//                    rejects when (entity, id, locale) is already stored
//                  store.get(entity, id, locale) -> Promise<row | undefined>
//                  store.rows(entity, id) -> Promise<row[]>   every stored row of that entity id
//   catalog-text.ts   createLocalizedCatalog({ store }) -> catalog:
//                  catalog.listCategories(locale) -> Promise<{ id, name, description, locale }[]>, only rows of that locale
//                  catalog.getProduct(id, locale) -> Promise<row | undefined>, undefined when that locale has no row
//                  both reject when locale is null/undefined
//   locale.ts    loadLocaleConfig({ locales: "en_US,ja_JP,zh_CN", default_locale: "en_US" }) -> { locales: string[], defaultLocale }
//                notificationLocale(orderLocale: string, { defaultLocale }) -> string | null
//                  "default" -> defaultLocale, no underscore -> null, "ja_JP" -> "ja_JP"
//                formatCurrency(amount, locale, fractionDigits) -> string
//                decodeJapanese(bytes: Uint8Array, encoding: "SJIS" | "JIS") -> string
//                readFormField(request: Request, field: string) -> Promise<string>   reads the body as UTF-8
//   sessions.ts  createLocaleSessions({ defaultLocale, timeoutMinutes: 30 }) -> sessions (clock passed in, never slept on):
//                sessions.start(now) -> Promise<sessionId>      a session with no locale yet
//                sessions.request(sessionId, { params?: { locale?: string } }, now)
//                  -> Promise<{ sessionId, isNew, locale }>     any request; sets the default when the session has none;
//                  a session idle for 30 minutes (1800000 ms) or more is replaced by a new one (isNew: true, default locale)
//                sessions.changeLocale(sessionId, code: string | undefined, now) -> Promise<{ locale }>
//                  code "language_COUNTRY" or "default"; anything else rejects with an error whose message
//                  matches /unable to change/i and leaves the session locale unchanged
//                sessions.session(sessionId) -> Promise<{ locale?: string }>
//   screens.ts   createScreenResolver({ screens: Record<locale, Record<page, string>>, defaultLocale })
//                  -> resolver.resolve({ page, param?, sessionLocale? }) -> { locale, screen }
//                  explicit param wins over sessionLocale; a locale with no screens falls back to defaultLocale
//   mail.ts      produceOrderMail({ order: { locale }, stylesheets: Record<locale, string> })
//                  -> Promise<{ stylesheet: string }>; rejects when no stylesheet exists for the order locale
const details = () => import("../../../server/localization/details");
const catalogText = () => import("../../../server/localization/catalog-text");
const loc = () => import("../../../server/localization/locale");
const sess = () => import("../../../server/localization/sessions");
const screens = () => import("../../../server/localization/screens");
const mail = () => import("../../../server/localization/mail");

const T0 = new Date("2026-01-01T10:00:00Z");
const at = (minutes: number) => new Date(T0.getTime() + minutes * 60_000);

async function newSessions(defaultLocale = "en_US") {
  const { createLocaleSessions } = await sess();
  const sessions = createLocaleSessions({ defaultLocale, timeoutMinutes: 30 });
  const id = await sessions.start(T0);
  return { sessions, id };
}

describe("locale-keyed details", () => {
  // case: SWHR8-C-0001@v1
  it("[SWHR8-C-0001] one product stored in en_US and ja_JP is addressable by (P1, locale)", async () => {
    const { createDetailsStore } = await details();
    const store = createDetailsStore();
    await store.put({
      entity: "product",
      id: "P1",
      locale: "en_US",
      name: "Goldfish",
      description: "A fish",
    });
    await store.put({
      entity: "product",
      id: "P1",
      locale: "ja_JP",
      name: "金魚",
      description: "魚です",
    });
    expect((await store.get("product", "P1", "en_US"))?.name).toBe("Goldfish");
    expect((await store.get("product", "P1", "ja_JP"))?.name).toBe("金魚");
    expect(await store.rows("product", "P1")).toHaveLength(2);
  });

  // case: SWHR8-C-0002@v1
  it("[SWHR8-C-0002] a second en_US detail row for the same item is rejected as a duplicate", async () => {
    const { createDetailsStore } = await details();
    const store = createDetailsStore();
    await store.put({
      entity: "item",
      id: "EST-1",
      locale: "en_US",
      name: "Large",
      description: "first",
    });
    await expect(
      store.put({
        entity: "item",
        id: "EST-1",
        locale: "en_US",
        name: "Large",
        description: "second",
      }),
    ).rejects.toThrow();
    const rows = await store.rows("item", "EST-1");
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe("first");
  });
});

describe("locale-keyed catalog text", () => {
  async function seeded() {
    const { createDetailsStore } = await details();
    const { createLocalizedCatalog } = await catalogText();
    const store = createDetailsStore();
    await store.put({
      entity: "category",
      id: "FISH",
      locale: "en_US",
      name: "Fish",
      description: "Water animals",
    });
    await store.put({
      entity: "category",
      id: "FISH",
      locale: "ja_JP",
      name: "魚",
      description: "水の生き物",
    });
    await store.put({
      entity: "product",
      id: "P1",
      locale: "en_US",
      name: "Goldfish",
      description: "A fish",
    });
    return createLocalizedCatalog({ store });
  }

  // case: SWHR8-C-0003@v1
  it("[SWHR8-C-0003] a ja_JP request returns the ja_JP names and descriptions only", async () => {
    const catalog = await seeded();
    const list = await catalog.listCategories("ja_JP");
    expect(list).toHaveLength(1);
    expect(list[0].name).toBe("魚");
    expect(list[0].description).toBe("水の生き物");
    expect(JSON.stringify(list)).not.toContain("Fish");
  });

  // case: SWHR8-C-0004@v1
  it("[SWHR8-C-0004] a zh_CN request for an en_US-only product returns no text and no substitute", async () => {
    const catalog = await seeded();
    expect(await catalog.getProduct("P1", "zh_CN")).toBeUndefined();
  });

  // case: SWHR8-C-0005@v1
  it("[SWHR8-C-0005] a null locale fails the catalog request and returns no data", async () => {
    const catalog = await seeded();
    await expect(catalog.listCategories(null as unknown as string)).rejects.toThrow();
    await expect(catalog.getProduct("P1", null as unknown as string)).rejects.toThrow();
  });
});

describe("encoding", () => {
  // case: SWHR8-C-0006@v1
  it("[SWHR8-C-0006] Japanese text in a UTF-8 form post is read uncorrupted", async () => {
    const { readFormField } = await loc();
    const text = "こんにちは世界 日本語のテキスト";
    const request = new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams({ note: text }).toString(),
    });
    expect(await readFormField(request, "note")).toBe(text);
  });

  // case: SWHR8-C-0026@v1
  it("[SWHR8-C-0026] SJIS bytes of Japanese text convert to the Unicode text", async () => {
    const { decodeJapanese } = await loc();
    const sjis = new Uint8Array([0x93, 0xfa, 0x96, 0x7b, 0x8c, 0xea]);
    expect(decodeJapanese(sjis, "SJIS")).toBe("日本語");
  });
});

describe("changing the session locale", () => {
  // case: SWHR8-C-0007@v1
  it('[SWHR8-C-0007] the code "english" is rejected and the session stays en_US', async () => {
    const { sessions, id } = await newSessions();
    await sessions.request(id, {}, T0);
    await expect(sessions.changeLocale(id, "english", T0)).rejects.toThrow(/unable to change/i);
    expect((await sessions.session(id)).locale).toBe("en_US");
  });

  // case: SWHR8-C-0008@v1
  it("[SWHR8-C-0008] a change request without a locale is rejected and the session stays ja_JP", async () => {
    const { sessions, id } = await newSessions();
    await sessions.changeLocale(id, "ja_JP", T0);
    await expect(sessions.changeLocale(id, undefined, T0)).rejects.toThrow(/unable to change/i);
    expect((await sessions.session(id)).locale).toBe("ja_JP");
  });

  // case: SWHR8-C-0009@v1
  it("[SWHR8-C-0009] after submitting ja_JP a later request in the session uses ja_JP", async () => {
    const { sessions, id } = await newSessions();
    await sessions.request(id, {}, T0);
    await sessions.changeLocale(id, "ja_JP", at(1));
    const later = await sessions.request(id, {}, at(2));
    expect(later.isNew).toBe(false);
    expect(later.locale).toBe("ja_JP");
  });

  // case: SWHR8-C-0025@v1
  it('[SWHR8-C-0025] the code "default" selects the server default locale', async () => {
    const { sessions, id } = await newSessions("zh_CN");
    await sessions.changeLocale(id, "ja_JP", T0);
    const changed = await sessions.changeLocale(id, "default", at(1));
    expect(changed.locale).toBe("zh_CN");
    expect((await sessions.session(id)).locale).toBe("zh_CN");
  });
});

describe("default session locale and timeout", () => {
  // case: SWHR8-C-0010@v1
  it("[SWHR8-C-0010] a session with no locale becomes en_US when a request is processed", async () => {
    const { sessions, id } = await newSessions();
    expect((await sessions.session(id)).locale).toBeUndefined();
    const res = await sessions.request(id, {}, T0);
    expect(res.locale).toBe("en_US");
    expect((await sessions.session(id)).locale).toBe("en_US");
  });

  // case: SWHR8-C-0027@v1
  it("[SWHR8-C-0027] a session idle for 30 minutes is replaced by a new one with the default locale", async () => {
    const { sessions, id } = await newSessions();
    await sessions.changeLocale(id, "ja_JP", T0);
    const res = await sessions.request(id, {}, at(30));
    expect(res.isNew).toBe(true);
    expect(res.sessionId).not.toBe(id);
    expect(res.locale).toBe("en_US");
  });
});

describe("screen language selection", () => {
  const defs = {
    en_US: { home: "Welcome" },
    ja_JP: { home: "ようこそ" },
  };

  // case: SWHR8-C-0011@v1
  it("[SWHR8-C-0011] the locale request parameter overrides the session locale", async () => {
    const { createScreenResolver } = await screens();
    const r = createScreenResolver({ screens: defs, defaultLocale: "en_US" });
    const res = r.resolve({ page: "home", param: "ja_JP", sessionLocale: "en_US" });
    expect(res.locale).toBe("ja_JP");
    expect(res.screen).toBe("ようこそ");
  });

  // case: SWHR8-C-0012@v1
  it("[SWHR8-C-0012] a locale with no screen definitions shows the default locale screens", async () => {
    const { createScreenResolver } = await screens();
    const r = createScreenResolver({ screens: defs, defaultLocale: "en_US" });
    const res = r.resolve({ page: "home", sessionLocale: "zh_CN" });
    expect(res.locale).toBe("en_US");
    expect(res.screen).toBe("Welcome");
  });
});

describe("locale-aware formatting and configuration", () => {
  // case: SWHR8-C-0013@v1
  it("[SWHR8-C-0013] 1234.5 in en_US with 2 fraction digits is $1,234.50", async () => {
    const { formatCurrency } = await loc();
    expect(formatCurrency(1234.5, "en_US", 2)).toBe("$1,234.50");
  });

  // case: SWHR8-C-0021@v1
  it("[SWHR8-C-0021] the configuration yields en_US, ja_JP and zh_CN with en_US as default", async () => {
    const { loadLocaleConfig } = await loc();
    const cfg = loadLocaleConfig({ locales: "en_US,ja_JP,zh_CN", default_locale: "en_US" });
    expect([...cfg.locales].sort()).toEqual(["en_US", "ja_JP", "zh_CN"]);
    expect(cfg.defaultLocale).toBe("en_US");
  });
});

describe("order e-mail language", () => {
  const stylesheets = { en_US: "mail_en_US.xsl", ja_JP: "mail_ja_JP.xsl", zh_CN: "mail_zh_CN.xsl" };

  // case: SWHR8-C-0014@v1
  it("[SWHR8-C-0014] an order with locale ja_JP uses the ja_JP stylesheet", async () => {
    const { produceOrderMail } = await mail();
    const res = await produceOrderMail({ order: { locale: "ja_JP" }, stylesheets });
    expect(res.stylesheet).toBe("mail_ja_JP.xsl");
  });

  // case: SWHR8-C-0015@v1
  it("[SWHR8-C-0015] an order locale with no stylesheet fails mail production", async () => {
    const { produceOrderMail } = await mail();
    await expect(produceOrderMail({ order: { locale: "de_DE" }, stylesheets })).rejects.toThrow();
  });
});

describe("notification locale derivation", () => {
  // case: SWHR8-C-0016@v1
  it('[SWHR8-C-0016] the order locale "default" yields the server default locale', async () => {
    const { notificationLocale } = await loc();
    expect(notificationLocale("default", { defaultLocale: "zh_CN" })).toBe("zh_CN");
  });

  // case: SWHR8-C-0017@v1
  it("[SWHR8-C-0017] an order locale without an underscore yields no locale", async () => {
    const { notificationLocale } = await loc();
    expect(notificationLocale("english", { defaultLocale: "en_US" })).toBeNull();
  });
});
