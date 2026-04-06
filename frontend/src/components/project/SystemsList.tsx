import { Button, Card } from "@/components/ui";
import type { ProjectSystemView } from "@/components/project/types";
import { formatSek, summarizePricing } from "@/lib/pricing";

type SystemsListProps = {
  systems: ProjectSystemView[];
  activeSystemId?: number | null;
  onSelect: (systemId: number) => void;
  onEdit: (systemId: number) => void;
  onRemove: (systemId: number) => void;
  removingId?: number;
  embedded?: boolean;
  /** Opens blank builder to add another saved system (does not overwrite existing). */
  onAddAnotherSystem?: () => void;
};

export function SystemsList({
  systems,
  activeSystemId,
  onSelect,
  onEdit,
  onRemove,
  removingId,
  embedded = false,
  onAddAnotherSystem,
}: SystemsListProps) {
  const body = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-baseline gap-2">
          <h2
            className={`text-sm font-semibold ${embedded ? "text-white" : "text-slate-900"}`}
          >
            Systems (zones) in project
          </h2>
          <span
            className={`text-xs font-medium ${embedded ? "text-slate-500" : "text-slate-500"}`}
          >
            {systems.length} saved
          </span>
        </div>
        {onAddAnotherSystem && (
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className={
              embedded
                ? "shrink-0 border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                : "shrink-0"
            }
            onClick={onAddAnotherSystem}
          >
            Add another system
          </Button>
        )}
      </div>
      <p
        className={`mt-2 text-xs leading-snug ${embedded ? "text-slate-500" : "text-slate-500"}`}
      >
        Select a zone to edit it in the workspace. Zones group line items; the project quotation
        combines every saved zone into one customer PDF by default.
      </p>
      {systems.length === 0 && (
        <p className={`mt-3 text-sm ${embedded ? "text-slate-400" : "text-slate-600"}`}>
          No saved zones yet. Save a named system to build the project quotation.
        </p>
      )}
      {systems.length > 0 && (
        <ul className="mt-4 space-y-2">
          {systems.map((system) => {
            const itemCount = system.items.reduce((sum, item) => sum + item.quantity, 0);
            const productTypeCount = system.items.length;
            const { subtotal, hasMissingPrices } = summarizePricing(system.items);
            const isActive = activeSystemId === system.id;
            return (
              <li
                key={system.id}
                className={`rounded-xl border p-3 text-xs transition-all duration-150 ${
                  embedded
                    ? isActive
                      ? "border-blue-500/50 bg-blue-950/40 shadow-md ring-1 ring-blue-500/20"
                      : "border-slate-700 bg-slate-800/40 hover:border-slate-600 hover:bg-slate-800/70"
                    : isActive
                      ? "border-blue-300 bg-blue-50/40 shadow-sm"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 hover:shadow-sm"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <button
                    type="button"
                    className="min-w-0 flex-1 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                    onClick={() => onSelect(system.id)}
                    aria-label={`Select system ${system.name}`}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={`font-semibold ${embedded ? "text-white" : "text-slate-900"}`}
                      >
                        {system.name}
                      </div>
                      {isActive && (
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                            embedded
                              ? "border-blue-400/40 bg-blue-600/30 text-blue-200"
                              : "border-blue-200 bg-blue-100 text-blue-800"
                          }`}
                        >
                          Active
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 ${embedded ? "text-slate-400" : "text-slate-500"}`}
                    >
                      <span>
                        {itemCount} qty • {productTypeCount} products
                      </span>
                      <span className={embedded ? "text-slate-600" : "text-slate-300"} aria-hidden>
                        ·
                      </span>
                      <span
                        className={`font-semibold ${embedded ? "text-slate-100" : "text-slate-800"}`}
                      >
                        {formatSek(subtotal)}
                      </span>
                      {hasMissingPrices && (
                        <span
                          className={`rounded-md border px-1.5 py-0.5 text-[10px] font-semibold ${
                            embedded
                              ? "border-amber-500/40 bg-amber-950/50 text-amber-200"
                              : "border-amber-200 bg-amber-50 text-amber-800"
                          }`}
                        >
                          Missing prices
                        </span>
                      )}
                    </div>
                    <div
                      className={`mt-1 text-[11px] ${embedded ? "text-slate-500" : "text-slate-400"}`}
                    >
                      Updated {new Date(system.updatedAt).toLocaleString()}
                    </div>
                  </button>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className={
                        embedded
                          ? "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                          : undefined
                      }
                      onClick={() => onEdit(system.id)}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      className={
                        embedded
                          ? "border-slate-600 bg-slate-800/80 text-slate-100 hover:bg-slate-700"
                          : undefined
                      }
                      onClick={() => onRemove(system.id)}
                      disabled={removingId === system.id}
                    >
                      {removingId === system.id ? "Removing…" : "Remove"}
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );

  if (embedded) {
    return (
      <section className="space-y-3 border-t border-slate-700/80 pt-5">{body}</section>
    );
  }

  return <Card>{body}</Card>;
}
