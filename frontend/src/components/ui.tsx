import { ReactNode } from "react";

export function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200/90 bg-white p-5 shadow-surface transition-all duration-150 ease-out hover:border-slate-300/80 hover:shadow-surface-hover">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">{title}</h1>
        {description && (
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}

export function Button(
  props: React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "primary" | "secondary" | "ghost";
    size?: "sm" | "md";
  },
) {
  const { variant = "primary", size = "md", className = "", ...rest } = props;
  const base =
    "inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150 ease-out active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:active:scale-100";
  const sizeClasses: Record<typeof size, string> = {
    sm: "min-h-9 px-3 py-1.5 text-xs",
    md: "min-h-11 px-5 py-2.5",
  } as const;
  const variants: Record<typeof variant, string> = {
    primary:
      "bg-blue-600 text-white shadow-[0_1px_2px_rgb(37_99_235_/_0.2)] hover:bg-blue-500 hover:shadow-[0_2px_8px_-2px_rgb(37_99_235_/_0.35)] hover:brightness-[1.02] hover:scale-[1.01] active:scale-[0.99] active:bg-blue-600",
    secondary:
      "border border-slate-200/90 bg-white font-medium text-slate-700 shadow-[0_1px_2px_rgb(15_23_42_/_0.04)] hover:border-slate-300/80 hover:bg-slate-50 active:bg-slate-100",
    ghost:
      "font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200",
  } as const;
  return (
    <button
      className={`${base} ${sizeClasses[size]} ${variants[variant]} ${className}`}
      {...rest}
    />
  );
}

export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label?: string },
) {
  const { label, id, className = "", ...rest } = props;
  const input = (
    <input
      id={id}
      className={`block w-full min-h-10 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${className}`}
      {...rest}
    />
  );
  if (!label) return input;
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
      {label}
      {input}
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string },
) {
  const { label, id, className = "", children, ...rest } = props;
  const select = (
    <select
      id={id}
      className={`block w-full min-h-10 rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
  if (!label) return select;
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
      {label}
      {select}
    </label>
  );
}

export function TextArea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string },
) {
  const { label, id, className = "", ...rest } = props;
  const textarea = (
    <textarea
      id={id}
      className={`block w-full rounded-xl border border-slate-200/90 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${className}`}
      {...rest}
    />
  );
  if (!label) return textarea;
  return (
    <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-500">
      {label}
      {textarea}
    </label>
  );
}

