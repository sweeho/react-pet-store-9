export interface ScreenResolver {
  resolve(req: { page: string; param?: string; sessionLocale?: string }): {
    locale: string;
    screen: string;
  };
}

/**
 * Screen-language selection (design L5): the request parameter wins over the
 * session locale, and a locale with no screen definitions falls back to the
 * default locale. Pure, so the browser reuses it.
 */
export function createScreenResolver(opts: {
  screens: Record<string, Record<string, string>>;
  defaultLocale: string;
}): ScreenResolver {
  return {
    resolve({ page, param, sessionLocale }) {
      const chosen = param ?? sessionLocale ?? opts.defaultLocale;
      const locale = opts.screens[chosen] ? chosen : opts.defaultLocale;
      return { locale, screen: opts.screens[locale]?.[page] ?? "" };
    },
  };
}
