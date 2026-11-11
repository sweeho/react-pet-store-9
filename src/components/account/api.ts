import { useEffect, useState } from "react";

export interface AccountSession {
  locale: string;
  signedOn: boolean;
  userName?: string;
  cartCount: number;
  rememberedUserName?: string;
  myList?: boolean;
  favoriteCategory?: string;
  banner?: boolean;
  bannerCategory?: string;
}

/** Screens that need a signed-on session (design A5). Everything else, the catalog included, is public. */
const PROTECTED = ["/account", "/account/new", "/order", "/signon/welcome"];

export const isProtected = (pathname: string): boolean =>
  PROTECTED.some((p) => pathname === p || (p === "/order" && pathname.startsWith("/order/")));

/** A `next` value is followed only when it is a path on this site. */
export const safeNext = (next: string | null | undefined, fallback = "/signon/welcome"): string =>
  next && next.startsWith("/") && !next.startsWith("//") && !next.includes("\\") ? next : fallback;

export async function fetchSession(): Promise<AccountSession | undefined> {
  try {
    const res = await fetch("/api/session");
    return res.ok ? ((await res.json()) as AccountSession) : undefined;
  } catch {
    return undefined;
  }
}

export function postJson(url: string, body: unknown, method = "POST"): Promise<Response> {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** The session, reloaded whenever `key` changes (the path); `undefined` until it has loaded for that key. */
export function useAccountSession(key: string): AccountSession | undefined {
  const [loaded, setLoaded] = useState<{ key: string; session?: AccountSession }>();
  useEffect(() => {
    let cancelled = false;
    void fetchSession().then((session) => {
      if (!cancelled) setLoaded({ key, session });
    });
    return () => {
      cancelled = true;
    };
  }, [key]);
  return loaded?.key === key
    ? (loaded.session ?? { locale: "", signedOn: false, cartCount: 0 })
    : undefined;
}
