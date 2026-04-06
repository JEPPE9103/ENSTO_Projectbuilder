import type { SystemItem } from "@/components/project/types";
import { formatSek, getLineTotal, summarizePricing } from "@/lib/pricing";

export type SystemReviewSlice = {
  id: number;
  name: string;
  items: SystemItem[];
};

type ProjectAllSystemsReviewPanelProps = {
  projectName: string;
  systems: SystemReviewSlice[];
};

export function ProjectAllSystemsReviewPanel({
  projectName,
  systems,
}: ProjectAllSystemsReviewPanelProps) {
  const enriched = systems.map((sys) => {
    const pricing = summarizePricing(sys.items);
    return { ...sys, ...pricing };
  });
  const projectSubtotal = enriched.reduce((sum, row) => sum + row.subtotal, 0);
  const anyMissing = enriched.some((row) => row.hasMissingPrices);

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Review — whole project</h2>
      <p className="mt-2 text-sm text-slate-600">
        Project <span className="font-semibold text-slate-800">{projectName}</span> includes{" "}
        {systems.length} saved {systems.length === 1 ? "zone" : "zones"}. Each block is one zone;
        subtotals roll up to the project total at the bottom.
      </p>

      <div className="mt-6 space-y-8">
        {enriched.map((sys) => {
          const { subtotal, hasMissingPrices } = sys;

          return (
            <article
              key={sys.id}
              className="rounded-2xl border border-slate-200/90 bg-slate-50/40 p-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-200/80 pb-3">
                <h3 className="text-base font-semibold text-slate-900">Zone: {sys.name}</h3>
                <span className="text-xs font-medium text-slate-500">
                  {sys.items.length} line{sys.items.length === 1 ? "" : "s"}
                </span>
              </div>

              {sys.items.length === 0 ? (
                <p className="mt-4 text-sm text-slate-500">No products in this system.</p>
              ) : (
                <ul className="mt-4 divide-y divide-slate-200/80 rounded-xl border border-slate-200/80 bg-white">
                  {sys.items.map((item) => {
                    const line = getLineTotal(item);
                    return (
                      <li
                        key={`${sys.id}-${item.productId}`}
                        className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-900">{item.name}</div>
                          <div className="font-mono text-xs text-slate-500">{item.articleNumber}</div>
                        </div>
                        <div className="text-sm tabular-nums text-slate-700">
                          Qty <span className="font-semibold">{item.quantity}</span>
                        </div>
                        <div className="text-sm font-semibold tabular-nums text-slate-900">
                          {line === null ? "—" : formatSek(line)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}

              <div className="mt-4 flex justify-end border-t border-slate-200/80 pt-3">
                <div className="text-right">
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Subtotal
                  </div>
                  <div className="text-lg font-bold tabular-nums text-slate-900">
                    {formatSek(subtotal)}
                  </div>
                  {hasMissingPrices && (
                    <p className="mt-1 text-xs text-amber-700">Some items missing prices</p>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="mt-8 border-t-2 border-slate-300 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Project total
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Sum of system subtotals (lines without prices are excluded).
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold tabular-nums text-slate-900">
              {formatSek(projectSubtotal)}
            </div>
            {anyMissing && (
              <p className="mt-1 text-xs text-amber-700">One or more systems have missing prices</p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
