/* eslint-disable @typescript-eslint/no-unused-vars -- stub until implemented */
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

export function createLocaleSessions(_opts: {
  defaultLocale: string;
  timeoutMinutes: number;
}): LocaleSessions {
  throw new Error("VortexNotImplemented");
}
