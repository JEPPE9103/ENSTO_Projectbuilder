import type { SystemMaterial } from "@/components/project/types";

type MaterialListProps = {
  materials: SystemMaterial[];
};

export function MaterialList({ materials }: MaterialListProps) {
  return (
    <section className="rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-sm transition-shadow duration-150 hover:shadow-md lg:p-8">
      <h2 className="text-lg font-semibold text-slate-900">
        Combined materials
      </h2>
      <p className="mt-2 text-sm text-slate-600">
        Aggregated across all saved systems in this project.
      </p>
      {materials.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          No combined materials yet. Save a system with products to populate this list.
        </p>
      )}
      {materials.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-[#E2E8F0]">
          <table className="min-w-full text-xs">
            <thead>
              <tr className="border-b border-[#E2E8F0] bg-slate-50/90 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-3 py-2.5">Product</th>
                <th className="px-3 py-2.5">Article</th>
                <th className="px-3 py-2.5 text-right">Qty</th>
                <th className="px-3 py-2.5">Unit</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((row) => (
                <tr
                  key={row.articleNumber}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/80"
                >
                  <td className="px-3 py-2.5 text-slate-800">{row.name}</td>
                  <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                    {row.articleNumber}
                  </td>
                  <td className="px-3 py-2.5 text-right text-sm font-semibold tabular-nums text-slate-900">
                    {row.quantity}
                  </td>
                  <td className="px-3 py-2.5 text-slate-700">{row.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
