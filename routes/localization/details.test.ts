import { describe, expect, it } from "vitest";

import { createDetailsStore } from "../../server/localization/details";

describe("details store", () => {
  it("[SWHR8-C-0001] one product stored in en_US and ja_JP is addressable by (P1, locale)", async () => {
    const store = createDetailsStore();
    await store.put({
      entity: "product",
      id: "P1",
      locale: "en_US",
      name: "Goldfish",
      description: "A fish",
    });
    await store.put({
      entity: "product",
      id: "P1",
      locale: "ja_JP",
      name: "金魚",
      description: "魚です",
    });
    expect((await store.get("product", "P1", "en_US"))?.name).toBe("Goldfish");
    expect((await store.get("product", "P1", "ja_JP"))?.name).toBe("金魚");
    expect(await store.get("product", "P1", "zh_CN")).toBeUndefined();
    expect(await store.rows("product", "P1")).toHaveLength(2);
  });

  it("[SWHR8-C-0002] a second en_US row for the same item is rejected as a duplicate", async () => {
    const store = createDetailsStore();
    const row = { entity: "item", id: "EST-1", locale: "en_US", name: "Large" } as const;
    await store.put({ ...row, description: "first" });
    await expect(store.put({ ...row, description: "second" })).rejects.toThrow(/duplicate/i);
    const rows = await store.rows("item", "EST-1");
    expect(rows).toHaveLength(1);
    expect(rows[0].description).toBe("first");
  });

  it("[SWHR8-C-0001] the same id in different entities does not collide", async () => {
    const store = createDetailsStore();
    await store.put({ entity: "category", id: "X", locale: "en_US", name: "c", description: "" });
    await store.put({ entity: "product", id: "X", locale: "en_US", name: "p", description: "" });
    expect(await store.list("category")).toHaveLength(1);
  });
});
