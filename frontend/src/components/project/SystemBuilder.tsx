import { useEffect, useMemo, useState } from "react";

import { Button, Input, TextArea } from "@/components/ui";
import type { Product } from "@/lib/api-types";
import { ProductFilters } from "@/components/project/catalog/ProductFilters";
import { ProductGrid } from "@/components/project/catalog/ProductGrid";
import {
  filterProducts,
  type ProductCatalogFilterState,
} from "@/lib/product-catalog";

type SystemBuilderProps = {
  systemName: string;
  notes: string;
  onSystemNameChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  itemsCount?: number;
  products: Product[];
  onAddProduct: (product: Product) => void;
  onSaveSystem: () => void;
  /** After a successful save, clears the builder so the next system can be added. */
  onSaveAndAddAnother?: () => void;
  onCancelEdit: () => void;
  onLoadMoreProducts: () => void;
  hasMoreProducts: boolean;
  isLoadingMoreProducts: boolean;
  isSaving: boolean;
  isEditing: boolean;
  /** Explicit create vs edit vs first system */
  builderMode?: "new-system" | "edit-saved" | "first-system";
  heading?: string;
  subheading?: string;
};

export function SystemBuilder({
  systemName,
  notes,
  onSystemNameChange,
  onNotesChange,
  itemsCount = 0,
  products,
  onAddProduct,
  onSaveSystem,
  onSaveAndAddAnother,
  onCancelEdit,
  onLoadMoreProducts,
  hasMoreProducts,
  isLoadingMoreProducts,
  isSaving,
  isEditing,
  builderMode = "first-system",
  heading,
  subheading,
}: SystemBuilderProps) {
  const [filters, setFilters] = useState<ProductCatalogFilterState>({
    query: "",
    category: "",
    series: "",
    color: "",
  });
  const [debouncedQuery, setDebouncedQuery] = useState(filters.query);
  const [recentlyAddedProductId, setRecentlyAddedProductId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(filters.query);
    }, 180);
    return () => clearTimeout(timeout);
  }, [filters.query]);

  const categories = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.category).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [products],
  );
  const seriesOptions = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.series).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [products],
  );
  const colorOptions = useMemo(
    () =>
      Array.from(new Set(products.map((p) => p.color).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b),
      ),
    [products],
  );

  const filteredProducts = useMemo(
    () => filterProducts(products, { ...filters, query: debouncedQuery }),
    [debouncedQuery, filters, products],
  );

  const trimmedName = systemName.trim();
  const nameError = trimmedName.length === 0 ? "System name is required." : null;
  const itemsError =
    itemsCount === 0 ? "Add at least one product before saving the system." : null;
  const canSave = !isSaving && !nameError && !itemsError;

  function handleAdd(product: Product) {
    onAddProduct(product);
    setRecentlyAddedProductId(product.id);
    window.setTimeout(() => {
      setRecentlyAddedProductId((current) =>
        current === product.id ? null : current,
      );
    }, 700);
  }

  const defaultHeading =
    builderMode === "new-system"
      ? "New system"
      : builderMode === "edit-saved"
        ? "Edit system"
        : "Add system";
  const defaultSub =
    builderMode === "new-system"
      ? "This adds another saved system to the project. Existing systems stay unchanged until you edit them."
      : "Name the system, then pick products from the catalog below.";

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{heading ?? defaultHeading}</h2>
        <p className="mt-2 text-sm text-slate-600">{subheading ?? defaultSub}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-1">
          <Input
            label="System name"
            placeholder="Corridor"
            value={systemName}
            onChange={(e) => onSystemNameChange(e.target.value)}
            className={nameError ? "border-rose-300 focus-visible:ring-rose-500" : ""}
          />
          {nameError && (
            <p className="text-xs font-medium text-rose-700">{nameError}</p>
          )}
        </div>
        <TextArea
          label="Notes (optional)"
          placeholder="Describe this installation area"
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="lg:col-span-2"
          rows={2}
        />
      </div>

      <div className="mt-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">
            Product catalog
          </h3>
          <span className="text-sm text-slate-500">
            {filteredProducts.length} matches
          </span>
        </div>
        <ProductFilters
          filters={filters}
          onChange={setFilters}
          categories={categories}
          seriesOptions={seriesOptions}
          colorOptions={colorOptions}
        />

        <ProductGrid
          products={filteredProducts}
          onAddProduct={handleAdd}
          recentlyAddedProductId={recentlyAddedProductId}
        />

        {hasMoreProducts && (
          <div className="flex justify-center pt-1">
            <Button
              type="button"
              size="md"
              variant="secondary"
              className="min-w-44"
              onClick={onLoadMoreProducts}
              disabled={isLoadingMoreProducts}
            >
              {isLoadingMoreProducts ? "Loading…" : "Load more products"}
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-[#E2E8F0] pt-8">
        <Button
          type="button"
          variant="secondary"
          className="rounded-xl transition-all duration-150 hover:scale-[1.01]"
          onClick={onSaveSystem}
          disabled={!canSave}
        >
          {isSaving ? "Saving…" : isEditing ? "Save system" : "Save system"}
        </Button>
        {onSaveAndAddAnother && (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl transition-all duration-150 hover:scale-[1.01]"
            onClick={onSaveAndAddAnother}
            disabled={!canSave}
          >
            {isSaving ? "Saving…" : "Save and add another system"}
          </Button>
        )}
        {itemsError && (
          <p className="text-xs font-medium text-slate-600">{itemsError}</p>
        )}
        {(isEditing || builderMode === "new-system") && (
          <Button
            type="button"
            variant="secondary"
            className="rounded-xl transition-all duration-150 hover:scale-[1.01]"
            onClick={onCancelEdit}
          >
            {builderMode === "new-system" ? "Exit new system" : "Discard changes"}
          </Button>
        )}
      </div>
    </section>
  );
}
