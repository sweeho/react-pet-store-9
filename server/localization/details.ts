export type DetailEntity = "category" | "product" | "item";
export interface DetailRow {
  entity: DetailEntity;
  id: string;
  locale: string;
  name: string;
  description: string;
}
export interface DetailsStore {
  put(row: DetailRow): Promise<void>;
  get(entity: DetailEntity, id: string, locale: string): Promise<DetailRow | undefined>;
  rows(entity: DetailEntity, id: string): Promise<DetailRow[]>;
  list(entity: DetailEntity): Promise<DetailRow[]>;
}

export function createDetailsStore(): DetailsStore {
  throw new Error("VortexNotImplemented");
}
