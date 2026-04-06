import type { Product } from "@/lib/api-types";

export type ProductCatalogFilterState = {
  query: string;
  category: string;
  series: string;
  color: string;
};

export function filterProducts(
  products: Product[],
  filters: ProductCatalogFilterState,
): Product[] {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const normalizedCategory = filters.category.trim().toLowerCase();
  const normalizedSeries = filters.series.trim().toLowerCase();
  const normalizedColor = filters.color.trim().toLowerCase();

  return products.filter((p) => {
    const eNumber = (p.e_number ?? "").toString().trim().toLowerCase();
    const articleNumber = (p.article_number ?? "").toString().trim().toLowerCase();
    const name = (p.name ?? "").trim().toLowerCase();
    const category = (p.category ?? "").trim().toLowerCase();
    const series = (p.series ?? "").trim().toLowerCase();
    const color = (p.color ?? "").trim().toLowerCase();

    if (
      normalizedQuery &&
      !(
        eNumber.includes(normalizedQuery) ||
        articleNumber.includes(normalizedQuery) ||
        name.includes(normalizedQuery)
      )
    ) {
      return false;
    }

    if (normalizedCategory && category !== normalizedCategory) {
      return false;
    }

    if (normalizedSeries && !series.includes(normalizedSeries)) {
      return false;
    }

    if (normalizedColor && !color.includes(normalizedColor)) {
      return false;
    }

    return true;
  });
}
