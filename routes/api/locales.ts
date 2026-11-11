import { defineHandler } from "nitro/h3";

import { localeConfigFromEnv } from "../../server/localization/locale";

// The configured locale codes (LOCALES, default en_US,ja_JP,zh_CN).
export default defineHandler(() => localeConfigFromEnv().locales.map((code) => ({ code })));
