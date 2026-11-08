// @vitest-environment node
import { describe, expect, it } from "vitest";

// Assumed module boundary: server/lib/diagnostics.ts exports
//   createDiagnostics({ enabled, write }): { print(msg), println(msg), exception(error, message?) }
// `enabled` stands for the build-time debugging switch; `write` receives every emitted chunk.
const loadDiagnostics = () => import("../../../server/lib/diagnostics");

describe("diagnostic output helper", () => {
  // case: SWHR8-C-0147@v1
  it("[SWHR8-C-0147] emits nothing when the debugging switch is off", async () => {
    const { createDiagnostics } = await loadDiagnostics();
    const out: string[] = [];
    const diag = createDiagnostics({ enabled: false, write: (s: string) => out.push(s) });

    diag.print("hello");
    diag.println("hello");
    diag.exception(new Error("boom"), "context");

    expect(out).toEqual([]);
  });

  // case: SWHR8-C-0148@v1
  it("[SWHR8-C-0148] writes exception message, then the message, then the stack trace", async () => {
    const { createDiagnostics } = await loadDiagnostics();
    const out: string[] = [];
    const diag = createDiagnostics({ enabled: true, write: (s: string) => out.push(s) });
    const error = new Error("boom-exception");

    diag.exception(error, "extra-context");
    const text = out.join("");

    const iException = text.indexOf("boom-exception");
    const iMessage = text.indexOf("extra-context");
    const iStack = text.indexOf(String(error.stack).split("\n")[1].trim());
    expect(iException).toBeGreaterThanOrEqual(0);
    expect(iMessage).toBeGreaterThan(iException);
    expect(iStack).toBeGreaterThan(iMessage);
  });
});
