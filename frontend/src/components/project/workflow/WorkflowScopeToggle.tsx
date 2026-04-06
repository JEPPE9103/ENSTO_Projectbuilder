type ScopeOption<V extends string> = {
  value: V;
  label: string;
};

type WorkflowScopeToggleProps<V extends string> = {
  value: V;
  onChange: (value: V) => void;
  options: ScopeOption<V>[];
  label?: string;
  className?: string;
};

export function WorkflowScopeToggle<V extends string>({
  value,
  onChange,
  options,
  label,
  className = "",
}: WorkflowScopeToggleProps<V>) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label ? (
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      ) : null}
      <div
        className="inline-flex flex-wrap gap-1 rounded-xl border border-slate-200/90 bg-slate-50/80 p-1"
        role="tablist"
      >
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              role="tab"
              aria-selected={active}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? "bg-white text-slate-900 shadow-sm ring-1 ring-slate-200/80"
                  : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
              }`}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
