// Administrator session idle expiry (design M2): 54 minutes, measured from creation or last use.
export const ADMIN_IDLE_MS = 54 * 60_000;

export interface AdminSessionRecord {
  id: string;
  lastUsed: number;
}

export function createAdminSession(now: Date = new Date()): AdminSessionRecord {
  return { id: crypto.randomUUID(), lastUsed: now.getTime() };
}

export function isAdminSessionExpired(
  session: Pick<AdminSessionRecord, "lastUsed">,
  now: Date = new Date(),
): boolean {
  return now.getTime() - session.lastUsed >= ADMIN_IDLE_MS;
}
