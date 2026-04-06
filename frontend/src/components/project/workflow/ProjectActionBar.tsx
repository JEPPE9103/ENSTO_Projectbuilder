import { Button } from "@/components/ui";

type ProjectActionBarProps = {
  onSaveProject: () => void;
  onGenerateQuoteSummary: () => void;
  onCopyBom: () => void;
  onPrepareExport: () => void;
  /** Primary: one combined PDF for the whole project (all saved zones). */
  onPrintProjectPdf: () => void | Promise<void>;
  /** Secondary: PDF for the currently selected zone only. */
  onPrintSelectedSystemPdf: () => void | Promise<void>;
  canPrintSelectedSystem?: boolean;
  isSaving: boolean;
  canGenerateQuote?: boolean;
  canPrintPdf?: boolean;
  generateQuoteHelperText?: string;
  printPdfHelperText?: string;
  embedded?: boolean;
};

const embeddedSecondary =
  "border-slate-600/90 bg-slate-800/50 font-medium text-slate-200 shadow-none hover:border-slate-500 hover:bg-slate-800 hover:text-white active:bg-slate-800";
const embeddedGhost =
  "font-medium text-slate-500 hover:bg-slate-800/60 hover:text-slate-300 active:bg-slate-800";

export function ProjectActionBar({
  onSaveProject,
  onGenerateQuoteSummary,
  onCopyBom,
  onPrepareExport,
  onPrintProjectPdf,
  onPrintSelectedSystemPdf,
  canPrintSelectedSystem = true,
  isSaving,
  canGenerateQuote = true,
  canPrintPdf = true,
  generateQuoteHelperText,
  printPdfHelperText,
  embedded = false,
}: ProjectActionBarProps) {
  const inner = embedded ? (
    <div className="flex flex-col gap-3.5">
      <Button
        type="button"
        onClick={onGenerateQuoteSummary}
        disabled={!canGenerateQuote}
        className="w-full min-h-[3.25rem] justify-center rounded-xl px-6 text-base font-semibold shadow-[0_2px_8px_-2px_rgb(37_99_235_/_0.45)] transition-all duration-150 hover:scale-[1.01] hover:brightness-[1.03] hover:shadow-[0_4px_20px_-4px_rgb(37_99_235_/_0.5)] disabled:hover:scale-100 disabled:hover:brightness-100"
      >
        Generate Project Quote
      </Button>
      {!canGenerateQuote && generateQuoteHelperText && (
        <p className="-mt-1 text-xs leading-relaxed text-slate-500">{generateQuoteHelperText}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onPrintProjectPdf}
        disabled={!canPrintPdf}
        className={`w-full min-h-11 justify-center rounded-xl text-sm font-medium ${embeddedSecondary}`}
      >
        Print / Save Project PDF
      </Button>
      {!canPrintPdf && printPdfHelperText && (
        <p className="-mt-1 text-xs leading-relaxed text-slate-500">{printPdfHelperText}</p>
      )}
      <div className="flex flex-wrap gap-2.5">
        <Button
          type="button"
          variant="secondary"
          className={`min-h-10 flex-1 justify-center rounded-xl text-sm ${embeddedSecondary}`}
          onClick={onSaveProject}
          disabled={isSaving}
        >
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className={`min-h-10 flex-1 justify-center rounded-xl text-sm ${embeddedSecondary}`}
          onClick={onCopyBom}
        >
          Copy BOM
        </Button>
      </div>
      <Button
        type="button"
        variant="secondary"
        onClick={onPrintSelectedSystemPdf}
        disabled={!canPrintSelectedSystem}
        className={`w-full min-h-10 justify-center rounded-xl text-xs font-medium ${embeddedSecondary}`}
      >
        Print selected system
      </Button>
      {!canPrintSelectedSystem && (
        <p className="-mt-1 text-xs leading-relaxed text-slate-500">
          Save a zone (system) or finish your new system draft to export one section.
        </p>
      )}
      <Button
        type="button"
        variant="ghost"
        className={`w-full justify-center rounded-xl text-sm ${embeddedGhost}`}
        onClick={onPrepareExport}
      >
        Prepare export
      </Button>
    </div>
  ) : (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
      <Button
        type="button"
        onClick={onGenerateQuoteSummary}
        disabled={!canGenerateQuote}
        className="order-first w-full min-h-11 rounded-xl px-6 text-base shadow-[0_1px_2px_rgb(37_99_235_/_0.2)] transition-all duration-150 hover:scale-[1.01] sm:order-none sm:w-auto sm:min-w-[220px]"
      >
        Generate Project Quote
      </Button>
      {!canGenerateQuote && generateQuoteHelperText && (
        <p className="text-xs text-slate-500">{generateQuoteHelperText}</p>
      )}
      <Button
        type="button"
        variant="secondary"
        onClick={onPrintProjectPdf}
        disabled={!canPrintPdf}
        className="min-h-11 rounded-xl px-4"
      >
        Print / Save Project PDF
      </Button>
      {!canPrintPdf && printPdfHelperText && (
        <p className="text-xs text-slate-500">{printPdfHelperText}</p>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="secondary" onClick={onSaveProject} disabled={isSaving}>
          {isSaving ? "Saving…" : "Save"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCopyBom}>
          Copy BOM
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={onPrintSelectedSystemPdf}
          disabled={!canPrintSelectedSystem}
          className="text-sm"
        >
          Print selected system
        </Button>
        <Button type="button" variant="ghost" onClick={onPrepareExport}>
          Prepare export
        </Button>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <div className="border-t border-slate-700/60 pt-8">{inner}</div>
    );
  }

  return (
    <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover">
      {inner}
    </section>
  );
}
