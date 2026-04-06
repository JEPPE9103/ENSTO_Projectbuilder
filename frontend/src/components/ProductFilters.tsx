import { Button, Input, Select } from "@/components/ui";
import type { Product } from "@/lib/api-types";

export type ProductFilterState = {
  query: string;
  category: string;
  series: string;
  color: string;
};

type ProductFiltersProps = {
  filters: ProductFilterState;
  onChange: (next: ProductFilterState) => void;
  onClear: () => void;
  products: Product[] | undefined;
  totalCount: number;
  filteredCount: number;
};

export function ProductFilters({
  filters,
  onChange,
  onClear,
  products,
  totalCount,
  filteredCount,
}: ProductFiltersProps) {
  const seriesOptions = Array.from(
    new Set(
      (products ?? [])
        .map((p) => (p.series ?? "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const colorOptions = Array.from(
    new Set(
      (products ?? [])
        .map((p) => (p.color ?? "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const categoryOptions = Array.from(
    new Set(
      (products ?? [])
        .map((p) => (p.category ?? "").trim())
        .filter((v) => v.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const handleFieldChange = (field: keyof ProductFilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  const summaryText =
    totalCount > 0 && filteredCount !== totalCount
      ? `Showing ${filteredCount} of ${totalCount} products`
      : totalCount > 0
        ? `Showing ${filteredCount} products`
        : "No products available";

  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-[1240px] rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="lg:col-span-2">
              <div className="flex flex-col gap-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <span>Search</span>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-2 inline-flex items-center text-slate-400">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M9 3.5A5.5 5.5 0 1 1 3.5 9 5.5 5.5 0 0 1 9 3.5Zm0-1.5a7 7 0 1 0 4.19 12.61l2.85 2.85a1 1 0 0 0 1.42-1.42l-2.85-2.85A7 7 0 0 0 9 2Z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <Input
                    placeholder="Search by E-number, article number, or name"
                    value={filters.query}
                    onChange={(e) => handleFieldChange("query", e.target.value)}
                    className="pl-7"
                  />
                </div>
              </div>
            </div>

            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => handleFieldChange("category", e.target.value)}
            >
              <option value="">All categories</option>
              {categoryOptions.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </Select>

            <Select
              label="Series"
              value={filters.series}
              onChange={(e) => handleFieldChange("series", e.target.value)}
            >
              <option value="">All series</option>
              {seriesOptions.map((series) => (
                <option key={series} value={series}>
                  {series}
                </option>
              ))}
            </Select>

            <Select
              label="Color"
              value={filters.color}
              onChange={(e) => handleFieldChange("color", e.target.value)}
            >
              <option value="">All colors</option>
              {colorOptions.map((color) => (
                <option key={color} value={color}>
                  {color.charAt(0).toUpperCase() + color.slice(1)}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-end justify-start lg:justify-end">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="w-full md:w-auto"
              onClick={onClear}
            >
              Clear filters
            </Button>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-500">{summaryText}</p>
    </div>
  );
}

