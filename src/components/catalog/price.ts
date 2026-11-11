import { formatCurrency } from "../../../server/localization/locale";

/** A price as currency in the shopper's locale: 2 fraction digits, none for ja_JP (design C5). */
export const formatPrice = (amount: number, locale: string): string =>
  formatCurrency(amount, locale, locale === "ja_JP" ? 0 : 2);
