import { describe, expect, it } from "vitest";

import { produceOrderMail } from "../../server/localization/mail";

const stylesheets = { en_US: "mail_en_US.xsl", ja_JP: "mail_ja_JP.xsl", zh_CN: "mail_zh_CN.xsl" };

describe("order mail", () => {
  it("[SWHR8-C-0014] an order with locale ja_JP uses the ja_JP stylesheet", async () => {
    const res = await produceOrderMail({ order: { locale: "ja_JP" }, stylesheets });
    expect(res.stylesheet).toBe("mail_ja_JP.xsl");
  });

  it('[SWHR8-C-0016] an order locale "default" uses the default locale stylesheet', async () => {
    const res = await produceOrderMail({
      order: { locale: "default" },
      stylesheets,
      defaultLocale: "zh_CN",
    });
    expect(res.stylesheet).toBe("mail_zh_CN.xsl");
  });

  it("[SWHR8-C-0015] an order locale with no stylesheet fails and no other is substituted", async () => {
    await expect(produceOrderMail({ order: { locale: "de_DE" }, stylesheets })).rejects.toThrow();
  });

  it("[SWHR8-C-0017] an unparseable order locale fails mail production", async () => {
    await expect(produceOrderMail({ order: { locale: "english" }, stylesheets })).rejects.toThrow();
  });
});
