import { createContext, useContext } from "react";

import { DEFAULT_LOCALE, resolver, SCREENS } from "./dictionaries";

export interface LocaleState {
  /** The locale whose screens are shown (after fallback). */
  locale: string;
  /** The session locale, which may have no screens (de_DE). */
  sessionLocale: string;
  setSessionLocale: (locale: string) => void;
}

export const LocaleContext = createContext<LocaleState>({
  locale: DEFAULT_LOCALE,
  sessionLocale: DEFAULT_LOCALE,
  setSessionLocale: () => {},
});

export interface Screen extends LocaleState {
  /** A screen string by key (`""` for an unknown key), with `{name}` placeholders filled from `vars`. */
  t: (key: string, vars?: Record<string, string>) => string;
}

export function useScreen(): Screen {
  const state = useContext(LocaleContext);
  const t: Screen["t"] = (key, vars) => {
    const text = SCREENS[state.locale]?.[key] ?? resolver.resolve({ page: key }).screen;
    return text.replace(/\{(\w+)\}/g, (_, name: string) => vars?.[name] ?? "");
  };
  return { ...state, t };
}
