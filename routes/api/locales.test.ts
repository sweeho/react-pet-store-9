import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locales from "./locales";

describe("GET /api/locales", () => {
  it("[SWHR8-C-0021] returns the three configured locale codes", async () => {
    const event = new H3Event(new Request("http://localhost/api/locales"));

    const result = await locales(event);

    expect(result).toEqual([{ code: "en_US" }, { code: "ja_JP" }, { code: "zh_CN" }]);
  });
});
