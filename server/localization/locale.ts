/* eslint-disable @typescript-eslint/no-unused-vars -- stub until implemented */
export interface LocaleConfig {
  locales: string[];
  defaultLocale: string;
}

export function loadLocaleConfig(_env: {
  locales?: string;
  default_locale?: string;
}): LocaleConfig {
  throw new Error("VortexNotImplemented");
}
export function parseLocaleCode(_code: unknown, _opts: { defaultLocale: string }): string | null {
  throw new Error("VortexNotImplemented");
}
export function notificationLocale(
  _orderLocale: string,
  _opts: { defaultLocale: string },
): string | null {
  throw new Error("VortexNotImplemented");
}
export function formatCurrency(_amount: number, _locale: string, _fractionDigits: number): string {
  throw new Error("VortexNotImplemented");
}
export function formatNumber(_value: number, _locale: string, _fractionDigits?: number): string {
  throw new Error("VortexNotImplemented");
}
export function parseKeywords(_text: string): string[] {
  throw new Error("VortexNotImplemented");
}
export function readFormField(_request: Request, _field: string): Promise<string> {
  throw new Error("VortexNotImplemented");
}
export function decodeJapanese(_bytes: Uint8Array, _encoding: "SJIS" | "JIS"): string {
  throw new Error("VortexNotImplemented");
}
