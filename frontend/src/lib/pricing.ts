import type { SystemItem } from "@/components/project/types";

export function toNumberOrNull(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function getEffectiveUnitPrice(item: SystemItem): number | null {
  const override = toNumberOrNull(item.unitPriceOverride);
  if (override !== null) return override;
  return toNumberOrNull(item.catalogUnitPrice);
}

export function getLineTotal(item: SystemItem): number | null {
  const effective = getEffectiveUnitPrice(item);
  if (effective === null) return null;
  return roundCurrency(item.quantity * effective);
}

export function summarizePricing(items: SystemItem[]) {
  let subtotal = 0;
  let hasMissingPrices = false;
  for (const item of items) {
    const line = getLineTotal(item);
    if (line === null) {
      hasMissingPrices = true;
      continue;
    }
    subtotal += line;
  }
  return { subtotal: roundCurrency(subtotal), hasMissingPrices };
}

export function roundCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

export function formatSek(value: number | null): string {
  if (value === null) return "No price set";
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}
