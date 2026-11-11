import { H3Event } from "nitro/h3";
import { describe, expect, it } from "vitest";

import locale from "../../../middleware/locale";
import profileGet from "./profile.get";

describe("GET /api/account/profile", () => {
  it("[SWHR8-C-0185] answers 401 when signed out", async () => {
    const event = new H3Event(new Request("http://localhost/api/account/profile"));
    await locale(event);
    await expect(Promise.resolve().then(() => profileGet(event))).rejects.toMatchObject({
      status: 401,
    });
  });
});
