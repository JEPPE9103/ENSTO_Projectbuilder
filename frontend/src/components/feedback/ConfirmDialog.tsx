"use client";

import { type ReactNode, useEffect } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onCancel();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  const confirmClass = destructive
    ? "bg-rose-600 text-white hover:bg-rose-500 active:bg-rose-700"
    : "bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700";

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 print:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/30"
        aria-label="Close dialog"
        onClick={onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg rounded-2xl border border-[#E2E8F0] bg-white p-6 shadow-xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-base font-semibold text-slate-900">{title}</h2>
            {description && (
              <div className="mt-2 text-sm leading-relaxed text-slate-600">{description}</div>
            )}
          </div>
          <button
            type="button"
            className="rounded-xl border border-[#E2E8F0] px-2 py-1 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            onClick={onCancel}
          >
            Esc
          </button>
        </div>

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            className="min-h-10 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-medium text-slate-800 transition-all duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            onClick={onCancel}
          >
            {cancelText}
          </button>
          <button
            type="button"
            className={`min-h-10 rounded-xl px-4 text-sm font-semibold shadow-sm transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${confirmClass}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

