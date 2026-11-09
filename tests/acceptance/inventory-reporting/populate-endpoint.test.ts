// @vitest-environment node
import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

// Assumed module boundary: routes/api/populate.ts default-exports an H3 handler for
//   GET /api/populate?forcefully=<true|false>
// that responds { reloaded: boolean }: true when sample catalog, customer and user data were (re)loaded.
const loadPopulate = () => import("../../../routes/api/populate");

const call = async (forcefully: boolean) => {
  const { default: handler } = await loadPopulate();
  const event = new H3Event(new Request(`http://localhost/api/populate?forcefully=${forcefully}`));
  return handler(event) as Promise<{ reloaded: boolean }>;
};

describe("sample data load endpoint", () => {
  // case: SWHR8-C-0149@v1
  it("[SWHR8-C-0149] with forcefully=false does not reload data that is already loaded", async () => {
    await call(false); // ensures the sample data is present
    const second = await call(false);

    expect(second.reloaded).toBe(false);
  });

  // case: SWHR8-C-0150@v1
  it("[SWHR8-C-0150] with forcefully=true reloads all sample data", async () => {
    await call(false); // ensures the sample data is present
    const forced = await call(true);

    expect(forced.reloaded).toBe(true);
  });
});
