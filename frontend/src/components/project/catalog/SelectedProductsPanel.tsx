import { Fragment } from "react";

import { Button } from "@/components/ui";
import type { SystemItem } from "@/components/project/types";

type SelectedProductsPanelProps = {
  items: SystemItem[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  recentlyAddedProductId?: number | null;
  /** Omit outer chrome when placed in the global right rail */
  embedded?: boolean;
};

export function SelectedProductsPanel({
  items,
  onIncrease,
  onDecrease,
  onRemove,
  recentlyAddedProductId = null,
  embedded = false,
}: SelectedProductsPanelProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueProducts = items.length;
  const categoriesUsed = new Set(items.map((item) => item.category).filter(Boolean)).size;

  const inner = (
    <Fragment>
      <div
        className={`mb-4 border-b pb-4 ${embedded ? "border-slate-700/80" : "border-slate-100"}`}
      >
        <div
          className={`text-xs font-medium uppercase tracking-wide ${embedded ? "text-slate-500" : "text-slate-500"}`}
        >
          System summary
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <SummaryStat
            label="Total items"
            value={String(totalItems)}
            embedded={embedded}
          />
          <SummaryStat label="Unique" value={String(uniqueProducts)} embedded={embedded} />
          <SummaryStat
            label="Categories"
            value={String(categoriesUsed)}
            embedded={embedded}
          />
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h3
          className={`text-base font-semibold ${embedded ? "text-white" : "text-slate-900"}`}
        >
          Selected products
        </h3>
        <span
          className={`rounded-xl border px-2.5 py-0.5 text-[11px] font-semibold tabular-nums ${
            embedded
              ? "border-slate-600 bg-slate-800/80 text-slate-200"
              : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          {totalItems} items
        </span>
      </div>

      {items.length === 0 && (
        <div
          className={`rounded-2xl border border-dashed px-3 py-5 text-center ${
            embedded
              ? "border-slate-600 bg-slate-800/30"
              : "border-slate-200 bg-slate-50/80"
          }`}
        >
          <p
            className={`text-sm font-medium ${embedded ? "text-slate-200" : "text-slate-700"}`}
          >
            No products added yet
          </p>
          <p className={`mt-1 text-xs ${embedded ? "text-slate-500" : "text-slate-500"}`}>
            Start by adding products from the catalog on the left.
          </p>
        </div>
      )}

      {items.length > 0 && (
        <div
          className={`flex flex-col gap-2 overflow-auto pr-1 ${embedded ? "max-h-[min(50vh,28rem)]" : "max-h-[62vh]"}`}
        >
          {items.map((item) => (
            <div
              key={item.productId}
              className={`rounded-xl border p-3 text-xs shadow-sm transition-all duration-150 ${
                embedded
                  ? recentlyAddedProductId === item.productId
                    ? "border-blue-500/60 bg-slate-800/90 ring-1 ring-blue-500/30"
                    : "border-slate-700 bg-slate-800/50 hover:border-slate-600 hover:shadow-md"
                  : recentlyAddedProductId === item.productId
                    ? "border-blue-300 bg-white ring-1 ring-blue-100"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md"
              }`}
            >
              <div
                className={`text-sm font-semibold ${embedded ? "text-white" : "text-slate-900"}`}
              >
                {item.name}
              </div>
              <div
                className={`mt-0.5 font-mono text-[11px] ${embedded ? "text-slate-500" : "text-slate-500"}`}
              >
                {item.articleNumber}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div
                  className={`inline-flex items-center gap-1 rounded-lg border px-1.5 py-0.5 ${
                    embedded ? "border-slate-600 bg-slate-900/50" : "border-slate-200"
                  }`}
                >
                  <button
                    type="button"
                    className={`px-1 transition-colors ${
                      embedded
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => onDecrease(item.productId)}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span
                    className={`min-w-[1.5rem] text-center font-semibold tabular-nums ${
                      embedded ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    className={`px-1 transition-colors ${
                      embedded
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    onClick={() => onIncrease(item.productId)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className={
                    embedded
                      ? "text-slate-400 hover:bg-slate-700/50 hover:text-rose-300"
                      : undefined
                  }
                  onClick={() => onRemove(item.productId)}
                >
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Fragment>
  );

  if (embedded) {
    return <div className="space-y-4">{inner}</div>;
  }

  return (
    <aside className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-shadow duration-150 hover:shadow-md">
      {inner}
    </aside>
  );
}

function SummaryStat({
  label,
  value,
  embedded,
}: {
  label: string;
  value: string;
  embedded?: boolean;
}) {
  return (
    <div>
      <div
        className={`text-[10px] font-medium uppercase tracking-wide ${embedded ? "text-slate-500" : "text-slate-500"}`}
      >
        {label}
      </div>
      <div
        className={`mt-0.5 text-sm font-semibold tabular-nums ${embedded ? "text-white" : "text-slate-900"}`}
      >
        {value}
      </div>
    </div>
  );
}
