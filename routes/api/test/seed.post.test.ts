import { H3Event } from "nitro/h3";
import { afterEach, describe, expect, it } from "vitest";

import categories from "../catalog/categories.get";
import seed from "./seed.post";

function post(body: unknown) {
  return seed(
    new H3Event(
      new Request("http://localhost/api/test/seed", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    ),
  );
}

afterEach(() => {
  delete process.env.NODE_ENV;
  process.env.NODE_ENV = "test";
});

describe("POST /api/test/seed", () => {
  it("adds the posted rows and replaces rows with the same key", async () => {
    const list = async () => {
      const event = new H3Event(new Request("http://localhost/api/catalog/categories?count=50"));
      event.context.locale = "en_US";
      return ((await categories(event)) as { rows: { id: string; name: string }[] }).rows;
    };
    const before = (await list()).length;
    await post({ categories: [{ id: "NEW", name: "Newts", locale: "en_US" }] });
    await post({ categories: [{ id: "NEW", name: "Salamanders", locale: "en_US" }] });
    const after = await list();
    expect(after).toHaveLength(before + 1);
    expect(after.find((c) => c.id === "NEW")?.name).toBe("Salamanders");
  });

  it("is refused in production", async () => {
    process.env.NODE_ENV = "production";
    await expect(post({})).rejects.toMatchObject({ status: 404 });
  });
});
