import { useEffect, useState } from "react";

export interface CatalogSession {
  myList?: boolean;
  favoriteCategory?: string;
}

/** The MyList fields of the session. Sign-on (SWHR8-I-0005) supplies them; until then both are absent. */
export function useCatalogSession(): CatalogSession | undefined {
  const [session, setSession] = useState<CatalogSession>();
  useEffect(() => {
    let cancelled = false;
    fetch("/api/session")
      .then((res) => (res.ok ? (res.json() as Promise<CatalogSession>) : undefined))
      .then((value) => {
        if (!cancelled) setSession(value);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);
  return session;
}
