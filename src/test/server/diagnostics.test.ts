import { describe, expect, it } from "vitest";

import { createDiagnostics, DEBUGGING_ON } from "../../../server/lib/diagnostics";

describe("diagnostics", () => {
  it("[SWHR8-C-0147] emits nothing when the switch is off", () => {
    const out: string[] = [];
    const d = createDiagnostics({ enabled: false, write: (s) => void out.push(s) });
    d.print("a");
    d.println("a");
    d.exception(new Error("boom"), "ctx");
    expect(out).toEqual([]);
  });

  it("[SWHR8-C-0148] writes exception message, message, then stack", () => {
    const out: string[] = [];
    const d = createDiagnostics({ enabled: true, write: (s) => void out.push(s) });
    const error = new Error("boom-exception");
    d.exception(error, "extra-context");
    expect(out[0]).toContain("boom-exception");
    expect(out[1]).toContain("extra-context");
    expect(out[2]).toBe(`${error.stack}\n`);
  });

  it("prints with and without newline; the delivered build is off", () => {
    const out: string[] = [];
    const d = createDiagnostics({ enabled: true, write: (s) => void out.push(s) });
    d.print("a");
    d.println("b");
    expect(out).toEqual(["a", "b\n"]);
    expect(DEBUGGING_ON).toBe(false);
  });
});
