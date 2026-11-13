// @vitest-environment node
import { describe, expect, it } from "vitest";

import { handleAdminAction } from "../../../../server/lib/admin-launcher";

const session = { id: "sess-42" };

describe("administration launcher", () => {
  // case: SWHR8-C-0255@v1
  it("[SWHR8-C-0255] manageorders returns a descriptor naming host, port, session id and path", () => {
    const r = handleAdminAction({ action: "manageorders", session, host: "shop.test", port: 8443 });
    expect(r.kind).toBe("launch");
    if (r.kind !== "launch") return;
    expect(JSON.parse(r.descriptor)).toEqual({
      host: "shop.test",
      port: 8443,
      sessionId: "sess-42",
      path: "/admin/orders",
    });
  });

  // case: SWHR8-C-0256@v1
  it("[SWHR8-C-0256] logout shows the logout page", () => {
    expect(handleAdminAction({ action: "logout", session, host: "h", port: 80 })).toEqual({
      kind: "logout-page",
    });
  });

  // case: SWHR8-C-0257@v1
  it("[SWHR8-C-0257] no action gives an empty response", () => {
    expect(handleAdminAction({ session, host: "h", port: 80 })).toEqual({ kind: "empty" });
  });
});
