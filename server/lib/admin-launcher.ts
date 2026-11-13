export type LauncherResult =
  | { kind: "launch"; descriptor: string }
  | { kind: "logout-page" }
  | { kind: "empty" };
export function handleAdminAction(_args: {
  action?: string;
  session: { id: string } | null;
  host: string;
  port: number;
}): LauncherResult {
  throw new Error('VortexNotImplemented');
}
