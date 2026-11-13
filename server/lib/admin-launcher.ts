// The administration launcher (design M7): manage orders, log out, or nothing.
export type LauncherResult =
  | { kind: "launch"; descriptor: string }
  | { kind: "logout-page" }
  | { kind: "empty" };

export function handleAdminAction(args: {
  action?: string;
  session: { id: string } | null;
  host: string;
  port: number;
}): LauncherResult {
  const { action, session, host, port } = args;
  if (action === "manageorders" && session) {
    return {
      kind: "launch",
      descriptor: JSON.stringify({ host, port, sessionId: session.id, path: "/admin/orders" }),
    };
  }
  if (action === "logout") return { kind: "logout-page" };
  return { kind: "empty" };
}
