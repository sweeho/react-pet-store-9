// Administrator form login on the existing session (change swhr8-i-0010, design F7). Admin sign-on
// state is kept per session id beside the customer sign-on; the role is read from `user_role`.
import { HTTPError, type H3Event } from "nitro/h3";

import { clockFor } from "../customer/auth";
import { checkPassword } from "../customer/repository";
import { isAdminSessionExpired } from "../lib/admin-session";
import { ADMINISTRATOR_ROLE, hasRole } from "./repository";

export interface AdminSession {
  userName: string;
  isAdministrator: boolean;
}

// Per session: who signed on, and when it was last used (54-minute idle expiry, design M2).
const states = new Map<string, { userName: string; lastUsed: number }>();

/** Signs the session on as `userName` when the password is right; the role decides what it may do. */
export async function adminSignOn(
  sessionId: string,
  userName: string,
  password: string,
): Promise<AdminSession | null> {
  if (!userName || !(await checkPassword(userName, password))) return null;
  states.set(sessionId, { userName, lastUsed: clockFor(sessionId).getTime() });
  return { userName, isAdministrator: hasRole(userName, ADMINISTRATOR_ROLE) };
}

export const adminSignOff = (sessionId: string): void => void states.delete(sessionId);

export function adminSession(sessionId: string): AdminSession | null {
  const state = states.get(sessionId);
  if (!state) return null;
  const now = clockFor(sessionId);
  if (isAdminSessionExpired(state, now)) {
    states.delete(sessionId);
    return null;
  }
  state.lastUsed = now.getTime();
  const { userName } = state;
  return { userName, isAdministrator: hasRole(userName, ADMINISTRATOR_ROLE) };
}

/** 401 when not signed in to administration, 403 without the administrator role. */
export function requireAdministrator(event: H3Event): AdminSession {
  const session = adminSession(event.context.sessionId as string);
  if (!session) throw new HTTPError({ status: 401, message: "Sign in required" });
  if (!session.isAdministrator) throw new HTTPError({ status: 403, message: "Access denied" });
  return session;
}
