import type { SystemItem } from "@/components/project/types";
import { formatSek, getEffectiveUnitPrice, getLineTotal } from "@/lib/pricing";

type QuoteSummaryPrintableProps = {
  items: SystemItem[];
};

export function QuoteSummaryPrintable({ items }: QuoteSummaryPrintableProps) {
  return (
    <div className="quote-table-container overflow-auto rounded-xl border border-slate-200">
      <table className="quote-table min-w-full text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">
            <th className="px-3 py-2">Product</th>
            <th className="px-3 py-2">Article</th>
            <th className="px-3 py-2">Category</th>
            <th className="px-3 py-2 text-right">Qty</th>
            <th className="px-3 py-2 text-right">Catalog price</th>
            <th className="px-3 py-2 text-right">Override price</th>
            <th className="px-3 py-2 text-right">Unit price</th>
            <th className="px-3 py-2 text-right">Line total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.productId} className="border-b border-slate-100">
              <td className="px-3 py-2">{item.name}</td>
              <td className="px-3 py-2 font-mono text-[11px]">{item.articleNumber}</td>
              <td className="px-3 py-2">{item.category}</td>
              <td className="px-3 py-2 text-right font-semibold tabular-nums">{item.quantity}</td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                {formatSek(item.catalogUnitPrice)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-600">
                {formatSek(item.unitPriceOverride)}
              </td>
              <td className="px-3 py-2 text-right tabular-nums text-slate-700">
                {formatSek(getEffectiveUnitPrice(item))}
              </td>
              <td className="px-3 py-2 text-right font-medium tabular-nums text-slate-700">
                {(() => {
                  const lineTotal = getLineTotal(item);
                  return lineTotal === null ? "—" : formatSek(lineTotal);
                })()}
              </td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={8} className="px-3 py-6 text-center text-sm text-slate-500">
                No products added yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
