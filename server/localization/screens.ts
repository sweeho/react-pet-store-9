/* eslint-disable @typescript-eslint/no-unused-vars -- stub until implemented */
export interface ScreenResolver {
  resolve(req: { page: string; param?: string; sessionLocale?: string }): {
    locale: string;
    screen: string;
  };
}

export function createScreenResolver(_opts: {
  screens: Record<string, Record<string, string>>;
  defaultLocale: string;
}): ScreenResolver {
  throw new Error("VortexNotImplemented");
}
