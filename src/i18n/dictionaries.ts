import { createScreenResolver } from "../../server/localization/screens";
import { en_US, type ScreenKey } from "./screens/en_US";
import { ja_JP } from "./screens/ja_JP";
import { zh_CN } from "./screens/zh_CN";

export const DEFAULT_LOCALE = "en_US";

/** Screen definitions per locale. de_DE has none on purpose: it falls back to en_US (design L5). */
export const SCREENS: Record<string, Record<string, string>> = { en_US, ja_JP, zh_CN };

/** The same resolver the server uses, so the browser does not carry a second one. */
export const resolver = createScreenResolver({ screens: SCREENS, defaultLocale: DEFAULT_LOCALE });

export type { ScreenKey };
