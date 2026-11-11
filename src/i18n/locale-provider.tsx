import { useEffect, useMemo, useState } from "react";

import { DEFAULT_LOCALE, resolver } from "./dictionaries";
import { LocaleContext } from "./locale-context";

/**
 * Loads the session locale once, picks the screen language with the shared
 * resolver (`?locale=` first), and keeps `<html lang>` on the resolved locale.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [sessionLocale, setSessionLocale] = useState(DEFAULT_LOCALE);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/session")
      .then((res) => (res.ok ? (res.json() as Promise<{ locale?: string }>) : undefined))
      .then((session) => {
        if (!cancelled && session?.locale) setSessionLocale(session.locale);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  const param = new URLSearchParams(window.location.search).get("locale") ?? undefined;
  const { locale } = resolver.resolve({ page: "nav.home", param, sessionLocale });

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const value = useMemo(
    () => ({ locale, sessionLocale, setSessionLocale }),
    [locale, sessionLocale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
