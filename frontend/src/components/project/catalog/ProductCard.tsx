import { Button } from "@/components/ui";
import type { Product } from "@/lib/api-types";

type ProductCardProps = {
  product: Product;
  onAdd: (product: Product) => void;
  isJustAdded: boolean;
};

export function ProductCard({ product, onAdd, isJustAdded }: ProductCardProps) {
  return (
    <article
      className={`flex h-full min-h-[240px] w-full min-w-0 flex-col rounded-2xl border bg-white p-5 shadow-surface transition-all duration-150 hover:scale-[1.01] hover:border-slate-300/90 hover:shadow-surface-hover ${
        isJustAdded
          ? "border-blue-400/50 ring-1 ring-blue-500/25"
          : "border-slate-200/90"
      }`}
    >
      <div className="flex min-h-0 flex-1 flex-col space-y-3">
        <div className="flex items-start justify-between gap-3">
          <h4
            title={product.name}
            className="min-h-[2.875rem] min-w-0 flex-1 line-clamp-2 text-base font-medium leading-tight text-slate-900"
          >
            {product.name}
          </h4>
          <span className="shrink-0 rounded-lg border border-slate-200/90 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600">
            {product.category}
          </span>
        </div>
        <p className="font-mono text-xs font-medium text-slate-700">
          {product.article_number}
        </p>
        <p className="mt-1 text-xs leading-relaxed text-slate-500">
          {[
            product.category,
            product.series,
            product.size,
            product.color,
            product.length_meters != null ? `${product.length_meters} m` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
        <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
          {product.series && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.series}
            </span>
          )}
          {product.size && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.size}
            </span>
          )}
          {product.color && (
            <span className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5">
              {product.color}
            </span>
          )}
          {product.length_meters != null && (
            <span
              title={`${product.length_meters} m`}
              className="rounded-full border border-slate-200/90 bg-slate-50 px-2 py-0.5 font-medium tabular-nums text-slate-600"
            >
              {product.length_meters} m
            </span>
          )}
        </div>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
        <span className="text-xs text-slate-500">Add to this system</span>
        <Button
          type="button"
          size="sm"
          variant={isJustAdded ? "secondary" : "primary"}
          className={`rounded-xl transition-all duration-150 hover:scale-[1.03] ${
            isJustAdded
              ? "border-blue-200 bg-blue-50 font-semibold text-blue-900 hover:bg-blue-100"
              : "min-h-9 px-4 font-semibold shadow-sm"
          }`}
          onClick={() => onAdd(product)}
        >
          {isJustAdded ? "Added" : "Add"}
        </Button>
      </div>
    </article>
  );
}
