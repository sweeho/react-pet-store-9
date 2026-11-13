export interface AdminSessionRecord {
  id: string;
  lastUsed: number;
}
export function createAdminSession(_now?: Date): AdminSessionRecord {
  throw new Error('VortexNotImplemented');
}
export function isAdminSessionExpired(_session: AdminSessionRecord, _now?: Date): boolean {
  throw new Error('VortexNotImplemented');
}
