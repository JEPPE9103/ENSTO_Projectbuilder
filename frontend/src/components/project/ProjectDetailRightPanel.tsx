"use client";

import { SelectedProductsPanel } from "@/components/project/catalog/SelectedProductsPanel";
import type { ProjectSystemView, SystemItem } from "@/components/project/types";
import { SystemsList } from "@/components/project/SystemsList";
import { ProjectActionBar } from "@/components/project/workflow/ProjectActionBar";
import { formatSek, summarizePricing } from "@/lib/pricing";

export type ProjectDetailRightPanelProps = {
  activeStep: number;
  /** Shown under the live-quote header on Review / Quote steps */
  liveQuoteHint?: string;
  currentItems: SystemItem[];
  systems: ProjectSystemView[];
  onIncrease: (productId: number) => void;
  onDecrease: (productId: number) => void;
  onRemove: (productId: number) => void;
  onSaveProject: () => void;
  onGenerateQuoteSummary: () => void;
  onCopyBom: () => void;
  onPrepareExport: () => void;
  onPrintProjectPdf: () => void | Promise<void>;
  onPrintSelectedSystemPdf: () => void | Promise<void>;
  canPrintSelectedSystem?: boolean;
  onEditSystem: (systemId: number) => void;
  onRemoveSystem: (systemId: number) => void;
  activeSystemId?: number | null;
  removingSystemId?: number;
  isSaving: boolean;
  canGenerateQuote?: boolean;
  canPrintPdf?: boolean;
  generateQuoteHelperText?: string;
  printPdfHelperText?: string;
  onStartNewSystem?: () => void;
};

export function ProjectDetailRightPanel({
  activeStep,
  liveQuoteHint,
  currentItems,
  systems,
  onIncrease,
  onDecrease,
  onRemove,
  onSaveProject,
  onGenerateQuoteSummary,
  onCopyBom,
  onPrepareExport,
  onPrintProjectPdf,
  onPrintSelectedSystemPdf,
  canPrintSelectedSystem = true,
  onEditSystem,
  onRemoveSystem,
  activeSystemId,
  removingSystemId,
  isSaving,
  canGenerateQuote,
  canPrintPdf,
  generateQuoteHelperText,
  printPdfHelperText,
  onStartNewSystem,
}: ProjectDetailRightPanelProps) {
  const totalQty = currentItems.reduce((sum, item) => sum + item.quantity, 0);
  const uniqueLines = currentItems.length;
  const { subtotal, hasMissingPrices } = summarizePricing(currentItems);

  return (
    <div className="flex flex-col gap-6">
      <header className="border-b border-slate-700/60 pb-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Live line list
        </p>
        <p className="mt-2 text-xs font-medium leading-relaxed text-slate-400">
          {liveQuoteHint ??
            "Totals here follow the zone loaded in the workspace (Build). The customer-facing quotation is the project quote on step 4."}
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 text-center">
        <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 px-3 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Lines
          </p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums tracking-tight text-white">
            {uniqueLines}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700/80 bg-slate-800/40 px-3 py-3.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Qty
          </p>
          <p className="mt-1.5 text-lg font-semibold tabular-nums tracking-tight text-white">
            {totalQty}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-600/50 bg-slate-950 px-6 py-7 shadow-[0_8px_32px_-8px_rgba(0,0,0,0.45)]">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
          Subtotal
        </p>
        <p className="mt-3 text-4xl font-semibold leading-none tracking-tight text-white tabular-nums sm:text-[2.5rem]">
          {formatSek(subtotal)}
        </p>
        {hasMissingPrices && (
          <p className="mt-6 border-t border-slate-700/80 pt-5 text-xs font-medium leading-relaxed text-amber-200/90">
            Some lines have no price — excluded from this total.
          </p>
        )}
      </div>

      <div className="border-t border-slate-700/60 pt-8">
        {activeStep === 2 ? (
          <SelectedProductsPanel
            embedded
            items={currentItems}
            onIncrease={onIncrease}
            onDecrease={onDecrease}
            onRemove={onRemove}
          />
        ) : (
          <SystemsList
            embedded
            systems={systems}
            activeSystemId={activeSystemId}
            onSelect={onEditSystem}
            onEdit={onEditSystem}
            onRemove={onRemoveSystem}
            removingId={removingSystemId}
            onAddAnotherSystem={onStartNewSystem}
          />
        )}
      </div>

      <ProjectActionBar
        embedded
        onSaveProject={onSaveProject}
        onGenerateQuoteSummary={onGenerateQuoteSummary}
        onCopyBom={onCopyBom}
        onPrepareExport={onPrepareExport}
        onPrintProjectPdf={onPrintProjectPdf}
        onPrintSelectedSystemPdf={onPrintSelectedSystemPdf}
        canPrintSelectedSystem={canPrintSelectedSystem}
        isSaving={isSaving}
        canGenerateQuote={canGenerateQuote}
        canPrintPdf={canPrintPdf}
        generateQuoteHelperText={generateQuoteHelperText}
        printPdfHelperText={printPdfHelperText}
      />
    </div>
  );
}
