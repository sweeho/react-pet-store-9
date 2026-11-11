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

const key = (entity: DetailEntity, id: string, locale: string) =>
  `${entity}\u0000${id}\u0000${locale}`;

/** In-memory details keyed by (entity, id, locale); a duplicate key is rejected (design L7). */
export function createDetailsStore(): DetailsStore {
  const rows = new Map<string, DetailRow>();
  return {
    async put(row) {
      const k = key(row.entity, row.id, row.locale);
      if (rows.has(k)) {
        throw new Error(`Duplicate details for ${row.entity} ${row.id} (${row.locale})`);
      }
      rows.set(k, { ...row });
    },
    async get(entity, id, locale) {
      return rows.get(key(entity, id, locale));
    },
    async rows(entity, id) {
      return [...rows.values()].filter((r) => r.entity === entity && r.id === id);
    },
    async list(entity) {
      return [...rows.values()].filter((r) => r.entity === entity);
    },
  };
}
