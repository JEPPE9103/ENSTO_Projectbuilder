"use client";

import { useState } from "react";

import { Button } from "@/components/ui";
import { ProductCard } from "@/components/ProductCard";
import { ProductDetailsModal } from "@/components/ProductDetailsModal";
import { ProductFilters, type ProductFilterState } from "@/components/ProductFilters";
import type { Product } from "@/lib/api-types";
import { useProductCatalog } from "@/hooks/useProducts";
import { filterProducts } from "@/lib/product-catalog";

export default function ProductsPage() {
  const [filters, setFilters] = useState<ProductFilterState>({
    query: "",
    category: "",
    series: "",
    color: "",
  });

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const {
    data: products,
    isLoading,
    isError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useProductCatalog();

  const handleOpenDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  const handleCloseDetails = () => {
    setIsDetailsOpen(false);
  };

  const filteredProducts = filterProducts(products ?? [], filters);

  const handleClearFilters = () => {
    setFilters({
      query: "",
      category: "",
      series: "",
      color: "",
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-[1560px] flex-col gap-7 xl:gap-8">
      <div className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Catalog
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Scan and filter the ENSTO catalog here. To build systems and quotes, work
          in <span className="font-medium text-slate-800">Projects</span> →{" "}
          <span className="font-medium text-slate-800">Build System</span>.
        </p>
      </div>

      <ProductFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
        products={products}
        totalCount={products?.length ?? 0}
        filteredCount={filteredProducts.length}
      />

      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-surface transition-all duration-150 hover:shadow-surface-hover sm:p-6 xl:p-7">
        {isLoading && (
          <p className="text-sm text-slate-500">Loading products…</p>
        )}

        {isError && (
          <p className="text-sm text-red-600">
            Could not load products. Please try again.
          </p>
        )}

        {!isLoading && filteredProducts.length === 0 && (
          <p className="text-sm text-slate-600">
            Nothing matches these filters. Clear or widen your search.
          </p>
        )}

        {!isLoading && filteredProducts.length > 0 && (
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3 xl:gap-6">
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
            {hasNextPage && (
              <div className="flex justify-center border-t border-[#E2E8F0] pt-6">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl transition-all duration-150 hover:scale-[1.01]"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                >
                  {isFetchingNextPage ? "Loading more…" : "Load more products"}
                </Button>
              </div>
            )}
          </div>
        )}
      </section>

      <ProductDetailsModal
        product={selectedProduct}
        open={isDetailsOpen}
        onClose={handleCloseDetails}
      />
    </div>
  );
}
