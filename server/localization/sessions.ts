import { localeConfigFromEnv, parseLocaleCode } from "./locale";

export interface LocaleSessions {
  start(now: Date): Promise<string>;
  request(
    sessionId: string,
    req: { params?: { locale?: string } },
    now: Date,
  ): Promise<{ sessionId: string; isNew: boolean; locale: string }>;
  changeLocale(sessionId: string, code: string | undefined, now: Date): Promise<{ locale: string }>;
  session(sessionId: string): Promise<{ locale?: string }>;
}

interface Entry {
  locale?: string;
  lastSeen: number;
}

/** The 30-minute idle timeout of the legacy web.xml. */
export const SESSION_TIMEOUT_MINUTES = 30;

export const CHANGE_ERROR = "Unable to change the language";

/**
 * In-memory session store with an idle timeout (design L4). The clock is
 * passed in, never read or slept on.
 */
export function createLocaleSessions(opts: {
  defaultLocale: string;
  timeoutMinutes: number;
}): LocaleSessions {
  const entries = new Map<string, Entry>();
  const timeoutMs = opts.timeoutMinutes * 60_000;

  const create = (now: Date): string => {
    const id = crypto.randomUUID();
    entries.set(id, { lastSeen: now.getTime() });
    return id;
  };

  return {
    async start(now) {
      return create(now);
    },

    async request(sessionId, req, now) {
      let id = sessionId;
      let entry = entries.get(id);
      let isNew = false;
      if (!entry || now.getTime() - entry.lastSeen >= timeoutMs) {
        entries.delete(id);
        id = create(now);
        entry = entries.get(id)!;
        isNew = true;
      }
      entry.lastSeen = now.getTime();
      entry.locale ??= opts.defaultLocale;
      const param = parseLocaleCode(req.params?.locale, opts);
      return { sessionId: id, isNew, locale: param ?? entry.locale };
    },

    async changeLocale(sessionId, code, now) {
      const entry = entries.get(sessionId);
      const locale = parseLocaleCode(code, opts);
      if (!entry || locale === null) throw new Error(CHANGE_ERROR);
      entry.locale = locale;
      entry.lastSeen = now.getTime();
      return { locale };
    },

    async session(sessionId) {
      return { locale: entries.get(sessionId)?.locale };
    },
  };
}

let shared: LocaleSessions | undefined;

/** The one process-wide session store; later capabilities attach to the same session id. */
export function sharedSessions(): LocaleSessions {
  shared ??= createLocaleSessions({
    defaultLocale: localeConfigFromEnv().defaultLocale,
    timeoutMinutes: SESSION_TIMEOUT_MINUTES,
  });
  return shared;
}
