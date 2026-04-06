import { Input, Select } from "@/components/ui";
import type { ProductCatalogFilterState } from "@/lib/product-catalog";

type ProductFiltersProps = {
  filters: ProductCatalogFilterState;
  onChange: (next: ProductCatalogFilterState) => void;
  categories: string[];
  seriesOptions: string[];
  colorOptions: string[];
};

export function ProductFilters({
  filters,
  onChange,
  categories,
  seriesOptions,
  colorOptions,
}: ProductFiltersProps) {
  const setField = (field: keyof ProductCatalogFilterState, value: string) => {
    onChange({ ...filters, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Input
        label="Search"
        placeholder="Name, article, or E-number"
        value={filters.query}
        onChange={(e) => setField("query", e.target.value)}
        className="rounded-lg"
      />
      <Select
        label="Category"
        value={filters.category}
        onChange={(e) => setField("category", e.target.value)}
        className="rounded-lg"
      >
        <option value="">All categories</option>
        {categories.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
      <Select
        label="Series"
        value={filters.series}
        onChange={(e) => setField("series", e.target.value)}
        className="rounded-lg"
      >
        <option value="">All series</option>
        {seriesOptions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
      <Select
        label="Color"
        value={filters.color}
        onChange={(e) => setField("color", e.target.value)}
        className="rounded-lg"
      >
        <option value="">All colors</option>
        {colorOptions.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </Select>
    </div>
  );
}
