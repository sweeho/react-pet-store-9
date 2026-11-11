import { describe, expect, it } from "vitest";

import {
  decodeJapanese,
  formatCurrency,
  formatNumber,
  loadLocaleConfig,
  notificationLocale,
  parseKeywords,
  parseLocaleCode,
  readFormField,
} from "../../server/localization/locale";

describe("locale configuration", () => {
  it("[SWHR8-C-0021] yields en_US, ja_JP and zh_CN with en_US as the default", () => {
    const cfg = loadLocaleConfig({ locales: "en_US,ja_JP,zh_CN", default_locale: "en_US" });
    expect(cfg.locales).toEqual(["en_US", "ja_JP", "zh_CN"]);
    expect(cfg.defaultLocale).toBe("en_US");
  });

  it("[SWHR8-C-0021] falls back to the three supported locales when nothing is configured", () => {
    const cfg = loadLocaleConfig({});
    expect(cfg.locales).toEqual(["en_US", "ja_JP", "zh_CN"]);
    expect(cfg.defaultLocale).toBe("en_US");
  });

  it("[SWHR8-C-0021] trims entries and drops unparseable ones", () => {
    const cfg = loadLocaleConfig({ locales: " ja_JP , english ,zh_CN", default_locale: "ja_JP" });
    expect(cfg.locales).toEqual(["ja_JP", "zh_CN"]);
    expect(cfg.defaultLocale).toBe("ja_JP");
  });
});

describe("locale code parsing", () => {
  const opts = { defaultLocale: "zh_CN" };

  it("[SWHR8-C-0007] a code without an underscore is unparseable", () => {
    expect(parseLocaleCode("english", opts)).toBeNull();
  });

  it("[SWHR8-C-0008] a missing code is unparseable", () => {
    expect(parseLocaleCode(undefined, opts)).toBeNull();
    expect(parseLocaleCode(null, opts)).toBeNull();
    expect(parseLocaleCode("", opts)).toBeNull();
  });

  it("[SWHR8-C-0007] a three-part code is unparseable", () => {
    expect(parseLocaleCode("en_US_x", opts)).toBeNull();
  });

  it("[SWHR8-C-0025] the code default yields the server default locale", () => {
    expect(parseLocaleCode("default", opts)).toBe("zh_CN");
  });

  it("[SWHR8-C-0009] language_COUNTRY codes are accepted and normalised", () => {
    expect(parseLocaleCode("ja_JP", opts)).toBe("ja_JP");
    expect(parseLocaleCode("de_de", opts)).toBe("de_DE");
  });
});

describe("notification locale", () => {
  it('[SWHR8-C-0016] "default" yields the server default locale', () => {
    expect(notificationLocale("default", { defaultLocale: "zh_CN" })).toBe("zh_CN");
  });

  it("[SWHR8-C-0017] a string without an underscore yields no locale", () => {
    expect(notificationLocale("english", { defaultLocale: "en_US" })).toBeNull();
  });

  it("[SWHR8-C-0014] a parseable code is returned as is", () => {
    expect(notificationLocale("ja_JP", { defaultLocale: "en_US" })).toBe("ja_JP");
  });
});

describe("formatting", () => {
  it("[SWHR8-C-0013] 1234.5 in en_US with 2 fraction digits is $1,234.50", () => {
    expect(formatCurrency(1234.5, "en_US", 2)).toBe("$1,234.50");
  });

  it("[SWHR8-C-0013] ja_JP uses the yen sign and a locale number style", () => {
    expect(formatCurrency(1234, "ja_JP", 0)).toMatch(/[¥￥]1,234/);
    expect(formatNumber(1234567.891, "en_US", 1)).toBe("1,234,567.9");
    expect(formatNumber(1234567.891, "de_DE", 1)).toBe("1.234.567,9");
  });

  it("[SWHR8-C-0013] keywords split on whitespace and empty input gives an empty list", () => {
    expect(parseKeywords("  gold  fish ")).toEqual(["gold", "fish"]);
    expect(parseKeywords("")).toEqual([]);
  });
});

describe("encoding", () => {
  it("[SWHR8-C-0006] Japanese text in a UTF-8 form post is read uncorrupted", async () => {
    const text = "こんにちは世界 日本語のテキスト";
    const request = new Request("http://localhost/echo", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ note: text }).toString(),
    });
    expect(await readFormField(request, "note")).toBe(text);
  });

  it("[SWHR8-C-0026] SJIS bytes convert to the Unicode text", () => {
    const sjis = new Uint8Array([0x93, 0xfa, 0x96, 0x7b, 0x8c, 0xea]);
    expect(decodeJapanese(sjis, "SJIS")).toBe("日本語");
  });

  it("[SWHR8-C-0026] JIS (ISO-2022-JP) bytes convert to the Unicode text", () => {
    const esc = (...b: number[]) => [0x1b, ...b];
    const jis = new Uint8Array([
      ...esc(0x24, 0x42), // ESC $ B: JIS X 0208
      0x46,
      0x7c,
      0x4b,
      0x5c,
      0x38,
      0x6c, // 日本語
      ...esc(0x28, 0x42), // ESC ( B: ASCII
      0x21,
    ]);
    expect(decodeJapanese(jis, "JIS")).toBe("日本語!");
  });
});
