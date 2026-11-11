import { DEFAULT_LOCALE, notificationLocale } from "./locale";

/** Stylesheet per locale; sending the mail is customer notifications' job (design L10). */
export const DEFAULT_STYLESHEETS: Record<string, string> = {
  en_US: "mail_en_US.xsl",
  ja_JP: "mail_ja_JP.xsl",
  zh_CN: "mail_zh_CN.xsl",
};

/** Picks the stylesheet by the order locale. There is no fallback: no stylesheet, no mail. */
export async function produceOrderMail(opts: {
  order: { locale: string };
  stylesheets?: Record<string, string>;
  defaultLocale?: string;
}): Promise<{ stylesheet: string }> {
  const locale = notificationLocale(opts.order.locale, {
    defaultLocale: opts.defaultLocale ?? DEFAULT_LOCALE,
  });
  const stylesheet =
    locale === null ? undefined : (opts.stylesheets ?? DEFAULT_STYLESHEETS)[locale];
  if (stylesheet === undefined) {
    throw new Error(`No mail stylesheet for order locale "${opts.order.locale}"`);
  }
  return { stylesheet };
}
