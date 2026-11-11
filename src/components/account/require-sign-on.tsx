import { Navigate, useLocation } from "react-router";

import { useScreen } from "@/i18n";

import { isProtected, useAccountSession } from "./api";

/** Sends a signed-out visitor of a protected screen to sign-on, which returns them to it (design A5). */
export function RequireSignOn({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { pathname, search } = useLocation();
  const { t } = useScreen();
  const session = useAccountSession(pathname);
  if (!isProtected(pathname)) return <>{children}</>;
  if (!session) return <p className="text-muted-foreground p-8 text-sm">{t("guard.checking")}</p>;
  if (!session.signedOn) {
    return <Navigate to={`/signon?next=${encodeURIComponent(pathname + search)}`} replace />;
  }
  return <>{children}</>;
}
