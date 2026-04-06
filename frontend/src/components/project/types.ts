import type { Product } from "@/lib/api-types";

export type SystemItem = {
  productId: number;
  eNumber: string;
  articleNumber: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  catalogUnitPrice: number | null;
  unitPriceOverride: number | null;
};

export type SystemMaterial = {
  productId: number | null;
  articleNumber: string;
  name: string;
  quantity: number;
  unit: string;
  lineTotal?: number | null;
};

export type ProjectSystemView = {
  id: number;
  name: string;
  notes?: string;
  items: SystemItem[];
  materials: SystemMaterial[];
  createdAt: string;
  updatedAt: string;
};

export function productToSystemItem(product: Product): SystemItem {
  return {
    productId: product.id,
    eNumber: product.e_number,
    articleNumber: product.article_number,
    name: product.name,
    category: product.category,
    quantity: 1,
    unit: product.unit,
    catalogUnitPrice: product.unit_price ?? null,
    unitPriceOverride: null,
  };
}
