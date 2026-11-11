import { describe, expect, it } from "vitest";

import { createLocalizedCatalog } from "./catalog-text";
import { createDetailsStore } from "./details";

async function seeded() {
  const store = createDetailsStore();
  await store.put({
    entity: "category",
    id: "FISH",
    locale: "en_US",
    name: "Fish",
    description: "Water animals",
  });
  await store.put({
    entity: "category",
    id: "FISH",
    locale: "ja_JP",
    name: "魚",
    description: "水の生き物",
  });
  await store.put({
    entity: "product",
    id: "P1",
    locale: "en_US",
    name: "Goldfish",
    description: "A fish",
  });
  return createLocalizedCatalog({ store });
}

describe("localized catalog", () => {
  it("[SWHR8-C-0003] a ja_JP request returns the ja_JP names and descriptions only", async () => {
    const list = await (await seeded()).listCategories("ja_JP");
    expect(list).toHaveLength(1);
    expect(list[0]).toMatchObject({ name: "魚", description: "水の生き物", locale: "ja_JP" });
    expect(JSON.stringify(list)).not.toContain("Fish");
  });

  it("[SWHR8-C-0004] a zh_CN request for an en_US-only product returns nothing and no substitute", async () => {
    const catalog = await seeded();
    expect(await catalog.getProduct("P1", "zh_CN")).toBeUndefined();
    expect(await catalog.listCategories("zh_CN")).toEqual([]);
  });

  it("[SWHR8-C-0003] a product is returned for the locale that has a row", async () => {
    expect((await (await seeded()).getProduct("P1", "en_US"))?.name).toBe("Goldfish");
  });

  it("[SWHR8-C-0005] a null or undefined locale fails the request", async () => {
    const catalog = await seeded();
    await expect(catalog.listCategories(null as unknown as string)).rejects.toThrow();
    await expect(catalog.getProduct("P1", undefined as unknown as string)).rejects.toThrow();
  });
});
