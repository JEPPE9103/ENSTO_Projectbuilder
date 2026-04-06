import type { SystemItem, SystemMaterial } from "@/components/project/types";
import { toNumberOrNull } from "@/lib/pricing";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }
  return fallback;
}

function pickUnknown(
  obj: Record<string, unknown>,
  camel: string,
  snake: string,
): unknown {
  if (camel in obj && obj[camel] !== undefined) return obj[camel];
  if (snake in obj && obj[snake] !== undefined) return obj[snake];
  return undefined;
}

export function normalizeConfigItems(data: unknown): SystemItem[] {
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (!isObject(item)) return null;
      const productId = toNumber(pickUnknown(item, "productId", "product_id"), -1);
      const articleNumber = String(
        pickUnknown(item, "articleNumber", "article_number") ?? "",
      );
      const name = String(pickUnknown(item, "name", "name") ?? "");
      if (productId <= 0 || articleNumber.length === 0 || name.length === 0) {
        return null;
      }
      return {
        productId,
        eNumber: String(pickUnknown(item, "eNumber", "e_number") ?? ""),
        articleNumber,
        name,
        category: String(pickUnknown(item, "category", "category") ?? ""),
        quantity: Math.max(1, toNumber(pickUnknown(item, "quantity", "quantity"), 1)),
        unit: String(pickUnknown(item, "unit", "unit") ?? "pcs"),
        catalogUnitPrice: toNumberOrNull(
          pickUnknown(item, "catalogUnitPrice", "catalog_unit_price"),
        ),
        unitPriceOverride: toNumberOrNull(
          pickUnknown(item, "unitPriceOverride", "unit_price_override"),
        ),
      } satisfies SystemItem;
    })
    .filter((value): value is SystemItem => value !== null);
}

export function normalizeConfigMaterials(data: unknown): SystemMaterial[] {
  if (!Array.isArray(data)) return [];
  const rows: SystemMaterial[] = [];
  for (const row of data) {
    if (!isObject(row)) continue;
    const articleNumber = String(
      pickUnknown(row, "articleNumber", "article_number") ?? "",
    );
    const name = String(pickUnknown(row, "name", "name") ?? "");
    if (!articleNumber || !name) continue;
    const pid = pickUnknown(row, "productId", "product_id");
    rows.push({
      productId: typeof pid === "number" ? pid : null,
      articleNumber,
      name,
      quantity: Math.max(0, toNumber(pickUnknown(row, "quantity", "quantity"), 0)),
      unit: String(pickUnknown(row, "unit", "unit") ?? "pcs"),
      lineTotal: toNumberOrNull(
        pickUnknown(row, "lineTotal", "line_total"),
      ),
    });
  }
  return rows;
}
