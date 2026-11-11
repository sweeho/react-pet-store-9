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
  it("replaces the catalog with the posted rows", async () => {
    await post({ categories: [{ id: "DOGS", name: "Dogs", locale: "en_US" }] });
    const event = new H3Event(new Request("http://localhost/api/catalog/categories"));
    event.context.locale = "en_US";
    expect(await categories(event)).toMatchObject({ rows: [{ id: "DOGS", name: "Dogs" }] });
  });

  it("is refused in production", async () => {
    process.env.NODE_ENV = "production";
    await expect(post({})).rejects.toMatchObject({ status: 404 });
  });
});
