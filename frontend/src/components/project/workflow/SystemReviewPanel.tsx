import { Button } from "@/components/ui";
import type { SystemItem } from "@/components/project/types";
import {
  formatSek,
  getEffectiveUnitPrice,
  getLineTotal,
  summarizePricing,
  toNumberOrNull,
} from "@/lib/pricing";

type SystemReviewPanelProps = {
  systemName: string;
  items: SystemItem[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onSetUnitPriceOverride: (productId: number, value: number | null) => void;
};

export function SystemReviewPanel({
  systemName,
  items,
  onIncrease,
  onDecrease,
  onRemove,
  onSetUnitPriceOverride,
}: SystemReviewPanelProps) {
  const groupedByCategory = new Map<string, SystemItem[]>();
  for (const item of items) {
    const key = item.category || "Other";
    const existing = groupedByCategory.get(key) ?? [];
    existing.push(item);
    groupedByCategory.set(key, existing);
  }
  const { subtotal, hasMissingPrices } = summarizePricing(items);

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Review — selected zone</h2>
      <p className="mt-2 text-base font-semibold text-slate-900">
        {systemName.trim() || "Current zone"}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        Secondary view: one zone only. Switch to whole project to inspect every zone together.
      </p>
      {items.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#E2E8F0] bg-slate-50/80 px-4 py-5 text-center">
          <p className="text-sm font-medium text-slate-700">
            No products added yet
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Start by adding products from the catalog in the previous step.
          </p>
        </div>
      )}

      <div className="mt-4 space-y-3">
        {Array.from(groupedByCategory.entries()).map(([category, categoryItems]) => (
          <div
            key={category}
            className="rounded-2xl border border-[#E2E8F0]/80 bg-slate-50/50 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{category}</h3>
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] text-slate-700">
                {categoryItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <ul className="divide-y divide-[#E2E8F0] rounded-xl border border-[#E2E8F0] bg-white">
              {categoryItems.map((item) => (
                <li
                  key={item.productId}
                  className="px-3 py-3 transition-colors hover:bg-slate-50/80"
                >
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[minmax(0,2.4fr)_120px_220px_140px] md:items-center">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                      <div className="text-sm font-mono text-slate-500">
                        {item.articleNumber}
                      </div>
                    </div>

                    <div className="flex justify-start md:justify-center">
                      <div className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-1 text-xs">
                        <button
                          type="button"
                          className="px-1 text-slate-600 hover:text-slate-900"
                          onClick={() => onDecrease(item.productId)}
                        >
                          -
                        </button>
                        <span className="min-w-[1.5rem] text-center font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          className="px-1 text-slate-600 hover:text-slate-900"
                          onClick={() => onIncrease(item.productId)}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500">
                        Unit price
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full rounded-lg border border-slate-300 py-2 pl-2 pr-10 text-right text-sm shadow-sm focus-visible:border-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-0"
                          value={item.unitPriceOverride ?? ""}
                          placeholder="0.00"
                          onChange={(e) =>
                            onSetUnitPriceOverride(
                              item.productId,
                              toNumberOrNull(e.target.value),
                            )
                          }
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-2 inline-flex items-center text-xs text-slate-400">
                          kr
                        </span>
                      </div>
                      <div className="mt-1 text-right text-[11px]">
                        {item.unitPriceOverride !== null ? (
                          <span className="font-semibold text-slate-900">
                            {formatSek(getEffectiveUnitPrice(item))}
                          </span>
                        ) : item.catalogUnitPrice !== null ? (
                          <span className="text-slate-600">
                            {formatSek(item.catalogUnitPrice)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">No price set</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <div className="mb-1 text-[10px] uppercase tracking-wide text-slate-500 text-right">
                        Line total
                      </div>
                      <div className="min-w-[120px] rounded-lg border border-slate-300 bg-slate-100/80 px-2 py-2 text-right text-base font-bold tabular-nums text-slate-900">
                        {(() => {
                          const lineTotal = getLineTotal(item);
                          return lineTotal === null ? "—" : formatSek(lineTotal);
                        })()}
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 flex justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={() => onRemove(item.productId)}
                    >
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-6 border-t-2 border-slate-200 pt-4">
        <div className="flex items-center justify-end gap-10">
          <span className="text-sm font-semibold text-slate-800">Subtotal</span>
          <span className="min-w-[140px] text-right text-xl font-bold tabular-nums text-slate-900">
            {formatSek(subtotal)}
          </span>
        </div>
        {hasMissingPrices && (
          <p className="mt-1 text-right text-xs text-amber-700">Some items missing prices</p>
        )}
      </div>
    </section>
  );
}
