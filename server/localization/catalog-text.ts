/* eslint-disable @typescript-eslint/no-unused-vars -- stub until implemented */
import type { DetailRow, DetailsStore } from "./details";

export interface LocalizedCatalog {
  listCategories(locale: string): Promise<DetailRow[]>;
  getProduct(id: string, locale: string): Promise<DetailRow | undefined>;
}

export function createLocalizedCatalog(_opts: { store: DetailsStore }): LocalizedCatalog {
  throw new Error("VortexNotImplemented");
}
