"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ToastVariant = "success" | "info" | "error";

export type Toast = {
  id: string;
  title: string;
  message?: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (input: Omit<Toast, "id"> & { id?: string; durationMs?: number }) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function randomId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef(new Map<string, number>());

  const dismiss = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (t) {
      window.clearTimeout(t);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (input: Omit<Toast, "id"> & { id?: string; durationMs?: number }) => {
      const id = input.id ?? randomId();
      const durationMs = input.durationMs ?? 3200;
      const toast: Toast = {
        id,
        title: input.title,
        message: input.message,
        variant: input.variant,
      };
      setToasts((prev) => [toast, ...prev].slice(0, 4));
      const timeout = window.setTimeout(() => dismiss(id), durationMs);
      timers.current.set(id, timeout);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  return (
    <div
      className="fixed right-4 top-4 z-[100] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2 print:hidden"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => {
        const palette =
          t.variant === "success"
            ? "border-emerald-200 bg-emerald-50 text-emerald-950"
            : t.variant === "error"
              ? "border-rose-200 bg-rose-50 text-rose-950"
              : "border-slate-200 bg-white text-slate-900";
        const title =
          t.variant === "success"
            ? "Success"
            : t.variant === "error"
              ? "Something went wrong"
              : t.title;
        return (
          <div
            key={t.id}
            className={`rounded-xl border px-3.5 py-3 shadow-sm ${palette}`}
            role="status"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-sm font-semibold">{t.variant === "info" ? t.title : title}</div>
                {t.message && (
                  <div className="mt-0.5 text-xs leading-relaxed opacity-90">{t.message}</div>
                )}
              </div>
              <button
                type="button"
                className="rounded-md px-2 py-1 text-xs font-medium opacity-70 transition-opacity hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                onClick={() => onDismiss(t.id)}
                aria-label="Dismiss notification"
              >
                Close
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

