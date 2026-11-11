import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import getUser from "./[id]";

/** INTEGRATION TEST: the route reads the name from `event.context.params`. */
const call = (id: string) =>
  getUser(new H3Event(new Request(`http://localhost/api/users/${id}`), { params: { id } }));

describe("GET /api/users/:name", () => {
  it("returns a sign-on user", async () => {
    expect(await call("shopper")).toEqual({ userName: "shopper" });
  });

  it("throws a 404 for a name that doesn't exist", async () => {
    await expect(call("nobody-here")).rejects.toMatchObject({ status: 404 });
  });
});
