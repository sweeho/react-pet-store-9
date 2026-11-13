import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import { db } from "../../db/client";
import { category, signonUser } from "../../db/schema";
import populate from "./populate";

const call = (forcefully: boolean) =>
  Promise.resolve(
    populate(new H3Event(new Request(`http://localhost/api/populate?forcefully=${forcefully}`))),
  ) as Promise<{ reloaded: boolean }>;

describe("GET /api/populate", () => {
  it("[SWHR8-C-0149] forcefully=false keeps data that is already loaded", async () => {
    expect((await call(false)).reloaded).toBe(false);
  });

  it("[SWHR8-C-0150] forcefully=true reloads all sample data", async () => {
    expect((await call(true)).reloaded).toBe(true);
    expect(db.select().from(category).all().length).toBeGreaterThan(0);
    expect(
      db
        .select()
        .from(signonUser)
        .all()
        .map((u) => u.userName),
    ).toContain("j2ee");
  });

  it("loads what is missing when not forced, then reports reloaded", async () => {
    db.delete(signonUser).run();
    expect((await call(false)).reloaded).toBe(true);
    expect((await call(false)).reloaded).toBe(false);
  });
});
