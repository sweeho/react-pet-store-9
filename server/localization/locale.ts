export interface LocaleConfig {
  locales: string[];
  defaultLocale: string;
}

export const DEFAULT_LOCALES = "en_US,ja_JP,zh_CN";
export const DEFAULT_LOCALE = "en_US";

/** Currency per locale (design L9). */
const CURRENCY: Record<string, string> = { en_US: "USD", ja_JP: "JPY", zh_CN: "CNY" };

const CODE = /^([A-Za-z]{2,3})_([A-Za-z]{2})$/;

/**
 * Parses a locale code (design L2): `language_COUNTRY`, normalised to `ll_CC`,
 * or the literal `default`, which means the configured default. Anything else
 * (missing, no underscore, a three-part legacy code) is unparseable: `null`.
 */
export function parseLocaleCode(code: unknown, opts: { defaultLocale: string }): string | null {
  if (typeof code !== "string") return null;
  const value = code.trim();
  if (value === "default") return opts.defaultLocale;
  const match = CODE.exec(value);
  if (!match) return null;
  return `${match[1].toLowerCase()}_${match[2].toUpperCase()}`;
}

/** Supported locales and the default (design L3). The legacy web.xml init-params, as keys. */
export function loadLocaleConfig(env: { locales?: string; default_locale?: string }): LocaleConfig {
  const defaultLocale = parseLocaleCode(env.default_locale ?? DEFAULT_LOCALE, {
    defaultLocale: DEFAULT_LOCALE,
  });
  const locales = (env.locales ?? DEFAULT_LOCALES)
    .split(",")
    .map((code) => parseLocaleCode(code, { defaultLocale: DEFAULT_LOCALE }))
    .filter((code): code is string => code !== null);
  return { locales, defaultLocale: defaultLocale ?? DEFAULT_LOCALE };
}

/** The server's configuration, read from `LOCALES` / `DEFAULT_LOCALE` (design L3). */
export function localeConfigFromEnv(env: NodeJS.ProcessEnv = process.env): LocaleConfig {
  return loadLocaleConfig({ locales: env.LOCALES, default_locale: env.DEFAULT_LOCALE });
}

/** The locale an order e-mail is written in; `null` when the order locale is unparseable. */
export function notificationLocale(
  orderLocale: string,
  opts: { defaultLocale: string },
): string | null {
  return parseLocaleCode(orderLocale, opts);
}

function bcp47(locale: string): string {
  return locale.replace("_", "-");
}

export function formatCurrency(amount: number, locale: string, fractionDigits: number): string {
  return new Intl.NumberFormat(bcp47(locale), {
    style: "currency",
    currency: CURRENCY[locale] ?? "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(amount);
}

export function formatNumber(value: number, locale: string, fractionDigits?: number): string {
  return new Intl.NumberFormat(
    bcp47(locale),
    fractionDigits === undefined
      ? undefined
      : { minimumFractionDigits: fractionDigits, maximumFractionDigits: fractionDigits },
  ).format(value);
}

/** Splits search keywords on whitespace. Empty input gives `[]`, never null (design L9). */
export function parseKeywords(text: string): string[] {
  return text.split(/\s+/).filter((word) => word !== "");
}

/** Reads one field of a form post, decoding the raw body as UTF-8 (design L8). */
export async function readFormField(request: Request, field: string): Promise<string> {
  const text = new TextDecoder("utf-8").decode(await request.arrayBuffer());
  return new URLSearchParams(text).get(field) ?? "";
}

const ESC = 0x1b;

/** Converts ISO-2022-JP to Shift_JIS bytes: each JIS X 0208 pair is mapped arithmetically. */
function jisToSjis(bytes: Uint8Array): Uint8Array {
  const out: number[] = [];
  let twoByte = false;
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i];
    if (b === ESC) {
      // ESC $ @ / ESC $ B start JIS X 0208; ESC ( B / ESC ( J return to ASCII.
      if (bytes[i + 1] === 0x24 && (bytes[i + 2] === 0x40 || bytes[i + 2] === 0x42)) twoByte = true;
      else if (bytes[i + 1] === 0x28) twoByte = false;
      i += 2;
      continue;
    }
    if (!twoByte || b < 0x21 || b > 0x7e) {
      out.push(b);
      continue;
    }
    const j2 = bytes[++i];
    if (j2 === undefined) break;
    out.push(((b + 1) >> 1) + (b <= 0x5e ? 0x70 : 0xb0));
    out.push(b % 2 === 1 ? j2 + (j2 >= 0x60 ? 0x20 : 0x1f) : j2 + 0x7e);
  }
  return Uint8Array.from(out);
}

/** Decodes legacy Japanese encodings (design L8). Bun cannot decode ISO-2022-JP itself. */
export function decodeJapanese(bytes: Uint8Array, encoding: "SJIS" | "JIS"): string {
  const sjis = encoding === "JIS" ? jisToSjis(bytes) : bytes;
  return new TextDecoder("shift_jis").decode(sjis);
}
