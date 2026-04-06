import type { SystemItem } from "@/components/project/types";

type ProjectStatsBarProps = {
  items: SystemItem[];
  systemsCount: number;
};

export function ProjectStatsBar({ items, systemsCount }: ProjectStatsBarProps) {
  const uniqueProducts = items.length;
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const categories = Array.from(new Set(items.map((item) => item.category))).filter(
    Boolean,
  );

  return (
    <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard label="Unique products" value={String(uniqueProducts)} />
      <StatCard label="Total quantity" value={String(totalQuantity)} />
      <StatCard label="Categories included" value={String(categories.length)} />
      <StatCard label="Saved systems" value={String(systemsCount)} />
    </section>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-4 shadow-sm transition-all duration-150 hover:shadow-md">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </div>
      <div className="mt-1.5 text-xl font-bold tabular-nums text-slate-900">{value}</div>
    </div>
  );
}
