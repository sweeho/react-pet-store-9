import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("acceptance configs", () => {
  it("playwright acceptance config discovers the specs sitting in each capability folder", () => {
    const out = execFileSync(
      "./node_modules/.bin/playwright",
      ["test", "-c", "playwright.acceptance.config.ts", "--list"],
      { encoding: "utf8" },
    );
    expect(out).toContain("site-shell/landing-and-navigation.spec.ts");
    expect(out).not.toContain("Total: 0 tests");
  }, 60_000);

  it("vitest acceptance config never picks up .spec.ts files", () => {
    const src = readFileSync("vitest.acceptance.config.ts", "utf8");
    expect(src).toMatch(/include:\s*\["tests\/acceptance\/\*\*\/\*\.test\./);
    expect(src).toContain('"tests/acceptance/**/*.spec.ts"');
  });
});
