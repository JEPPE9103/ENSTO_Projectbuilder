import type { Project } from "@/lib/api-types";
import type { SystemItem } from "@/components/project/types";
import { QuoteSummaryPrintable } from "@/components/project/workflow/QuoteSummaryPrintable";
import { formatSek, summarizePricing } from "@/lib/pricing";

export type QuoteSystemSlice = {
  id: number;
  name: string;
  items: SystemItem[];
};

type QuoteProjectSummaryCardProps = {
  project: Project;
  systems: QuoteSystemSlice[];
};

export function QuoteProjectSummaryCard({ project, systems }: QuoteProjectSummaryCardProps) {
  const today = new Date().toLocaleDateString();
  const enriched = systems.map((sys) => ({
    ...sys,
    ...summarizePricing(sys.items),
  }));
  const projectSubtotal = enriched.reduce((sum, row) => sum + row.subtotal, 0);
  const anyMissing = enriched.some((row) => row.hasMissingPrices);

  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#E2E8F0] pb-5">
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Project quote</h2>
          <p className="mt-2 text-base font-medium text-slate-900">Project quotation (default)</p>
          <p className="mt-1 text-sm text-slate-500">
            Main customer quotation: every saved zone as a section, zone subtotals, one project total.
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
        <Meta
          label="Zones included"
          value={`${systems.length} saved ${systems.length === 1 ? "zone" : "zones"}`}
        />
      </dl>

      {anyMissing && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Some items are missing prices and are excluded from totals.
        </div>
      )}

      <div className="mt-6 space-y-8">
        {enriched.map((sys) => (
          <div key={sys.id} className="rounded-2xl border border-slate-200/90 bg-slate-50/30 p-5">
            <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">Section: {sys.name}</h3>
              <span className="text-xs text-slate-500">{sys.items.length} lines</span>
            </div>
            <QuoteSummaryPrintable items={sys.items} />
            <div className="mt-3 flex justify-end border-t border-slate-200/80 pt-3">
              <div className="text-right">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Zone subtotal
                </span>
                <div className="text-lg font-bold tabular-nums text-slate-900">
                  {formatSek(sys.subtotal)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t-2 border-slate-200 pt-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <span className="text-sm font-semibold text-slate-800">Project grand total</span>
          <span className="text-2xl font-bold tabular-nums text-slate-900">
            {formatSek(projectSubtotal)}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Print layout preview (matches project PDF)
        </h3>
        <div className="space-y-6 rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4">
          {enriched.map((sys) => (
            <div key={`print-${sys.id}`}>
              <p className="mb-2 text-xs font-semibold text-slate-700">Section: {sys.name}</p>
              <QuoteSummaryPrintable items={sys.items} />
            </div>
          ))}
        </div>
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
