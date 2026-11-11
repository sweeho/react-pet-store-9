import { describe, expect, it } from "vitest";

import { createScreenResolver } from "../../server/localization/screens";

const defs = {
  en_US: { home: "Welcome", only_en: "English only" },
  ja_JP: { home: "ようこそ" },
};
const resolver = () => createScreenResolver({ screens: defs, defaultLocale: "en_US" });

describe("screen resolver", () => {
  it("[SWHR8-C-0011] the request parameter overrides the session locale", () => {
    const res = resolver().resolve({ page: "home", param: "ja_JP", sessionLocale: "en_US" });
    expect(res).toEqual({ locale: "ja_JP", screen: "ようこそ" });
  });

  it("[SWHR8-C-0012] a locale with no screens shows the default locale screens", () => {
    const res = resolver().resolve({ page: "home", sessionLocale: "zh_CN" });
    expect(res).toEqual({ locale: "en_US", screen: "Welcome" });
  });

  it("[SWHR8-C-0010] no choice at all uses the default locale", () => {
    expect(resolver().resolve({ page: "home" })).toEqual({ locale: "en_US", screen: "Welcome" });
  });

  it("[SWHR8-C-0012] a param without screens falls back to the default, not the session", () => {
    const res = resolver().resolve({ page: "home", param: "de_DE", sessionLocale: "ja_JP" });
    expect(res.locale).toBe("en_US");
  });
});
