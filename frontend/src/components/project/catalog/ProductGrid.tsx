import type { Product } from "@/lib/api-types";
import { ProductCard } from "@/components/project/catalog/ProductCard";

type ProductGridProps = {
  products: Product[];
  onAddProduct: (product: Product) => void;
  recentlyAddedProductId: number | null;
};

export function ProductGrid({
  products,
  onAddProduct,
  recentlyAddedProductId,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E2E8F0] bg-slate-50/50 px-4 py-10 text-center text-sm text-slate-600">
        No products match the current filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-2 xl:gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAdd={onAddProduct}
          isJustAdded={recentlyAddedProductId === product.id}
        />
      ))}
    </div>
  );
}
