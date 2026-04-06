import type { Project } from "@/lib/api-types";
import type { SystemItem } from "@/components/project/types";
import { QuoteSummaryPrintable } from "@/components/project/workflow/QuoteSummaryPrintable";
import {
  formatSek,
  getEffectiveUnitPrice,
  getLineTotal,
  summarizePricing,
  toNumberOrNull,
} from "@/lib/pricing";

type QuoteSummaryCardProps = {
  project: Project;
  systemName: string;
  items: SystemItem[];
  onSetUnitPriceOverride: (productId: number, value: number | null) => void;
};

export function QuoteSummaryCard({
  project,
  systemName,
  items,
  onSetUnitPriceOverride,
}: QuoteSummaryCardProps) {
  const today = new Date().toLocaleDateString();
  const { subtotal, hasMissingPrices } = summarizePricing(items);

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Zone quote
          </h2>
          <p className="mt-2 text-base font-medium text-slate-900">Selected zone only (secondary)</p>
          <p className="mt-1 text-sm text-slate-500">
            One internal section of the project. Use project quotation for the main customer PDF.
          </p>
        </div>
        <span className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600">
          {today}
        </span>
      </div>

      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
        <Meta label="Project" value={project.name} />
        <Meta label="Customer" value={project.customer_name} />
        <Meta label="Location" value={project.country} />
        <Meta label="Zone / system" value={systemName.trim() || "Current zone"} />
      </dl>

      {hasMissingPrices && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Some items are missing prices and are excluded from totals.
        </div>
      )}

      <div className="mt-5 overflow-auto rounded-2xl border border-[#E2E8F0]">
        <table className="min-w-full text-xs">
          <colgroup>
            <col className="min-w-[140px]" />
            <col className="w-[100px]" />
            <col className="min-w-[80px]" />
            <col className="w-[56px]" />
            <col className="w-[108px]" />
            <col className="w-[108px]" />
            <col className="w-[108px]" />
            <col className="w-[108px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
              <th className="px-3 py-2.5">Product</th>
              <th className="px-3 py-2.5">Article</th>
              <th className="px-3 py-2.5">Category</th>
              <th className="px-3 py-2.5 text-right">Qty</th>
              <th className="px-3 py-2.5 text-right">Catalog</th>
              <th className="px-3 py-2.5 text-right">Override</th>
              <th className="px-3 py-2.5 text-right">Unit</th>
              <th className="px-3 py-2.5 text-right">Line</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.productId}
                className="border-b border-slate-100 transition-colors hover:bg-slate-50/80"
              >
                <td className="px-3 py-2.5 align-middle text-slate-900">{item.name}</td>
                <td className="px-3 py-2.5 align-middle font-mono text-[11px] text-slate-600">
                  {item.articleNumber}
                </td>
                <td className="px-3 py-2.5 align-middle text-slate-700">{item.category}</td>
                <td className="px-3 py-2.5 text-right align-middle font-semibold tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-3 py-2.5 text-right align-middle tabular-nums text-slate-600">
                  {formatSek(item.catalogUnitPrice)}
                </td>
                <td className="px-3 py-2.5 text-right align-middle">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    className="ml-auto block w-full min-w-[5.5rem] max-w-[6.5rem] rounded-lg border border-slate-300 px-2 py-1.5 text-right text-xs tabular-nums shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                    value={item.unitPriceOverride ?? ""}
                    placeholder="—"
                    aria-label="Override unit price"
                    onChange={(e) =>
                      onSetUnitPriceOverride(
                        item.productId,
                        toNumberOrNull(e.target.value),
                      )
                    }
                  />
                </td>
                <td className="px-3 py-2.5 text-right align-middle tabular-nums text-slate-800">
                  {formatSek(getEffectiveUnitPrice(item))}
                </td>
                <td className="px-3 py-2.5 text-right align-middle text-sm font-bold tabular-nums text-slate-900">
                  {(() => {
                    const lineTotal = getLineTotal(item);
                    return lineTotal === null ? "—" : formatSek(lineTotal);
                  })()}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center">
                  <p className="text-sm font-medium text-slate-700">
                    No products added yet
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Add products in the system builder, then return to this quote.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50/80">
            <tr>
              <td
                colSpan={7}
                className="px-3 py-3 text-right text-sm font-semibold text-slate-800"
              >
                Zone subtotal
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-900">
                {formatSek(subtotal)}
              </td>
            </tr>
            <tr className="border-t border-slate-200">
              <td
                colSpan={7}
                className="px-3 py-3 text-right text-sm font-semibold text-slate-800"
              >
                Zone total
              </td>
              <td className="px-3 py-3 text-right text-sm font-bold tabular-nums text-slate-900">
                {formatSek(subtotal)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Printable quote preview
        </h3>
        <QuoteSummaryPrintable items={items} />
      </div>
    </section>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-100 pb-3 sm:border-0 sm:pb-0">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-900">{value}</dd>
    </div>
  );
}
