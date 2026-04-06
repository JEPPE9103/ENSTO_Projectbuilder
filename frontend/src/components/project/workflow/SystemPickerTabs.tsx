import type { ProjectSystemView } from "@/components/project/types";

type SystemPickerTabsProps = {
  systems: ProjectSystemView[];
  selectedId: number | null;
  onSelect: (systemId: number) => void;
  className?: string;
};

export function SystemPickerTabs({
  systems,
  selectedId,
  onSelect,
  className = "",
}: SystemPickerTabsProps) {
  if (systems.length === 0) return null;

  return (
    <div className={`min-w-0 ${className}`}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        Zone (system)
      </p>
      <div
        className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
      >
        {systems.map((sys) => {
          const active = selectedId === sys.id;
          return (
            <button
              key={sys.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`shrink-0 rounded-lg border px-3 py-2 text-left text-sm font-medium transition-colors ${
                active
                  ? "border-slate-900/20 bg-slate-900 text-white shadow-sm"
                  : "border-slate-200/90 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
              }`}
              onClick={() => onSelect(sys.id)}
            >
              <span className="block max-w-[10rem] truncate">{sys.name}</span>
              <span
                className={`mt-0.5 block text-[11px] font-normal tabular-nums ${
                  active ? "text-white/80" : "text-slate-500"
                }`}
              >
                {sys.items.length} products
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
