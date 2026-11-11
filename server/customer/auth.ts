// Sign-on state on the existing session (change swhr8-i-0005, design A4, A6). The clock is passed in.
import {
  createLocaleSessions,
  sharedSessions,
  type LocaleSessions,
} from "../localization/sessions";
import { dropCart } from "../cart/store";
import { checkPassword, getCustomer, getSignOnUser, saveSignOnUser } from "./repository";
import { validateNewUser } from "./model";

export const REMEMBER_COOKIE = "bp_signon";
export const REMEMBER_MAX_AGE = 31 * 24 * 60 * 60;
/** Idle time after which a signed-on session is signed off (legacy web.xml, 15 minutes). */
export const SIGNON_IDLE_MS = 15 * 60_000;

export const BANNER_CATEGORIES = ["FISH", "DOGS", "CATS", "REPTILES", "BIRDS"] as const;

export interface RememberCookie {
  name: string;
  value: string;
  maxAge: number;
}

export interface SessionView {
  active: boolean;
  signedOn: boolean;
  userName?: string;
  locale: string;
  cartLocale: string;
}

export function rememberedUserName(cookies: Record<string, string>): string | undefined {
  return cookies[REMEMBER_COOKIE] || undefined;
}

/** The category whose banner is shown: the favourite one, or dogs when it is unknown or empty. */
export function bannerCategory(favoriteCategory?: string | null): string {
  const id = (favoriteCategory ?? "").toUpperCase();
  return (BANNER_CATEGORIES as readonly string[]).includes(id) ? id : "DOGS";
}

export function bannerFor(profile: { banner: boolean; favoriteCategory?: string | null }): string {
  return `banner_${bannerCategory(profile.favoriteCategory).toLowerCase()}.gif`;
}

interface SignOnState {
  userName: string;
  lastSeen: number;
}

export function createAuth(sessions?: LocaleSessions) {
  // Standalone use keeps its own 15-minute session; the shared one passes the 30-minute locale store.
  const store = sessions ?? createLocaleSessions({ defaultLocale: "en_US", timeoutMinutes: 15 });
  const states = new Map<string, SignOnState>();

  const view = async (id: string, now: Date): Promise<SessionView> => {
    const r = await store.request(id, {}, now);
    if (r.isNew) {
      states.delete(id);
      return { active: false, signedOn: false, locale: r.locale, cartLocale: r.locale };
    }
    let state = states.get(id);
    if (state && now.getTime() - state.lastSeen >= SIGNON_IDLE_MS) {
      states.delete(id);
      dropCart(id);
      state = undefined;
    }
    if (state) state.lastSeen = now.getTime();
    return {
      active: true,
      signedOn: state !== undefined,
      userName: state?.userName,
      locale: r.locale,
      cartLocale: r.locale,
    };
  };

  return {
    start: (now: Date) => store.start(now),
    session: view,

    async signOn(
      id: string,
      input: {
        userName?: string;
        password?: string;
        remember?: boolean;
        cookies?: Record<string, string>;
      },
      now: Date,
    ): Promise<{ signedOn: boolean; cookie: RememberCookie | null }> {
      const { userName = "", password = "" } = input;
      if (!userName || !(await checkPassword(userName, password))) {
        return { signedOn: false, cookie: null };
      }
      states.set(id, { userName, lastSeen: now.getTime() });
      const customer = await getCustomer(userName);
      if (customer) await store.changeLocale(id, customer.profile.language, now).catch(() => {});
      let cookie: RememberCookie | null = null;
      if (input.remember) {
        cookie = { name: REMEMBER_COOKIE, value: userName, maxAge: REMEMBER_MAX_AGE };
      } else if (input.cookies && rememberedUserName(input.cookies) !== undefined) {
        cookie = { name: REMEMBER_COOKIE, value: "", maxAge: 0 };
      }
      return { signedOn: true, cookie };
    },

    /** Creates the sign-on user; the new user becomes the session's current user. */
    async register(
      id: string,
      input: { userName?: string; password?: string },
      now: Date,
    ): Promise<{ created: boolean; duplicate?: boolean; error?: string }> {
      try {
        validateNewUser(input);
      } catch (e) {
        return { created: false, error: (e as Error).message };
      }
      if (await getSignOnUser(input.userName!)) return { created: false, duplicate: true };
      await saveSignOnUser(input);
      states.set(id, { userName: input.userName!, lastSeen: now.getTime() });
      return { created: true };
    },

    /** Clears sign-on state and the cart; the locale stays. */
    signOff(id: string): void {
      states.delete(id);
    },
  };
}

export type Auth = ReturnType<typeof createAuth>;

let shared: Auth | undefined;
export function sharedAuth(): Auth {
  shared ??= createAuth(sharedSessions());
  return shared;
}

// Test clock (design A6): minutes added to one session's clock, so parallel browser tests never expire each other.
const offsets = new Map<string, number>();
export const advanceClock = (sessionId: string, minutes: number): void => {
  offsets.set(sessionId, (offsets.get(sessionId) ?? 0) + minutes * 60_000);
};
export const clockFor = (sessionId: string | undefined): Date =>
  new Date(Date.now() + (sessionId ? (offsets.get(sessionId) ?? 0) : 0));
