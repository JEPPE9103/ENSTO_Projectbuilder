"use client";

import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { QuoteSummaryPrintable } from "@/components/project/workflow/QuoteSummaryPrintable";
import { useProject, useProjectSystems } from "@/hooks/useProjects";
import type { ProjectSystemConfig } from "@/lib/api-types";
import type { SystemItem } from "@/components/project/types";
import { formatSek, summarizePricing } from "@/lib/pricing";
import { normalizeConfigItems } from "@/lib/project-system-config";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function itemsFromStored(
  config: ProjectSystemConfig | null | undefined,
): SystemItem[] {
  if (!config || !isObject(config)) return [];
  return normalizeConfigItems(config.items);
}

export default function QuotePrintPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const projectId = Number(params.id);
  const systemId = Number(searchParams.get("systemId"));
  const scope = searchParams.get("scope");
  const exportTag = searchParams.get("export");
  const autoPrint = searchParams.get("autoPrint") === "1";
  const isExplicitSystemExport = exportTag === "system";

  const { data: project } = useProject(projectId);
  const { data: systems, isPending: systemsLoading } = useProjectSystems(projectId);

  const printModel = useMemo(() => {
    const list = systems ?? [];
    if (!list.length) {
      return {
        mode: "empty" as const,
        systemTitle: "Not selected",
        sections: [] as { id: number; title: string; items: SystemItem[] }[],
        flatItems: [] as SystemItem[],
      };
    }

    const sectionsFromList = () =>
      list.map((s) => ({
        id: s.id,
        title: s.title,
        items: itemsFromStored(
          s.config_json && isObject(s.config_json)
            ? (s.config_json as ProjectSystemConfig)
            : undefined,
        ),
      }));

    if (scope === "project") {
      const sections = sectionsFromList();
      const flatItems = sections.flatMap((sec) => sec.items);
      return {
        mode: "project" as const,
        systemTitle:
          list.length === 1
            ? list[0].title
            : `Full project — ${list.length} zones`,
        sections,
        flatItems,
      };
    }

    if (!Number.isNaN(systemId) && systemId > 0) {
      const found = list.find((s) => s.id === systemId) ?? list[0];
      const items = itemsFromStored(
        found.config_json && isObject(found.config_json)
          ? (found.config_json as ProjectSystemConfig)
          : undefined,
      );
      return {
        mode: "system" as const,
        systemTitle: found.title,
        sections: [{ id: found.id, title: found.title, items }],
        flatItems: items,
      };
    }

    const sections = sectionsFromList();
    const flatItems = sections.flatMap((sec) => sec.items);
    return {
      mode: "project" as const,
      systemTitle:
        list.length === 1 ? list[0].title : `Full project — ${list.length} zones`,
      sections,
      flatItems,
    };
  }, [systems, systemId, scope]);

  const { subtotal: grandSubtotal, hasMissingPrices } = summarizePricing(
    printModel.flatItems,
  );
  const today = new Date().toLocaleDateString();

  useEffect(() => {
    if (!autoPrint) return;
    const timeout = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(timeout);
  }, [autoPrint]);

  if (!project || systemsLoading) {
    return <p className="text-sm text-slate-500">Loading quote...</p>;
  }

  if (printModel.mode === "empty") {
    return (
      <div className="print-page mx-auto w-full max-w-[210mm] bg-white p-8 text-slate-900">
        <p className="text-sm text-slate-600">No saved systems in this project yet.</p>
      </div>
    );
  }

  const isProjectLayout = printModel.mode === "project";
  const isSystemLayout = printModel.mode === "system";

  return (
    <div className="print-page mx-auto w-full max-w-[210mm] bg-white p-8 text-slate-900">
      <header className="border-b border-slate-300 pb-4">
        <p className="text-xs uppercase tracking-[0.15em] text-slate-500">ENSTO Sales Tool</p>
        <h1 className="mt-1 text-2xl font-semibold">
          {isProjectLayout ? "Project quotation" : "Quotation"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">Generated: {today}</p>
        {isProjectLayout && (
          <p className="mt-2 text-sm text-slate-600">
            One customer-facing quotation — zones below are sections inside this project.
          </p>
        )}
        {isSystemLayout && (
          <p className="mt-2 rounded border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
            {isExplicitSystemExport
              ? "Single-zone export (secondary). For the main customer offer, use Print / Save Project PDF."
              : "Showing one saved zone only. Combined project quotation includes all zones."}
          </p>
        )}
      </header>

      <section className="mt-5 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
        <Info label="Project name" value={project.name} />
        <Info label="Customer" value={project.customer_name} />
        <Info label="Location" value={project.country} />
        <Info
          label={isProjectLayout ? "Quotation scope" : "Zone / system"}
          value={
            isProjectLayout
              ? printModel.sections.length === 1
                ? `1 zone — ${printModel.sections[0].title}`
                : `Full project — ${printModel.sections.length} zones`
              : printModel.systemTitle
          }
        />
      </section>

      {hasMissingPrices && (
        <p className="mt-4 rounded border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          Some items are missing prices and are excluded from totals.
        </p>
      )}

      {isProjectLayout ? (
        <section className="mt-6 space-y-8">
          {printModel.sections.map((sec) => {
            const { subtotal: secSub } = summarizePricing(sec.items);
            return (
              <div key={sec.id} className="break-inside-avoid">
                <h2 className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
                  Section: {sec.title}
                </h2>
                <div className="mt-3">
                  <QuoteSummaryPrintable items={sec.items} />
                </div>
                <div className="mt-3 flex justify-end text-sm">
                  <span className="text-slate-600">Zone subtotal</span>
                  <span className="ml-4 font-semibold tabular-nums">{formatSek(secSub)}</span>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="mt-6 space-y-3">
          <h2 className="border-b border-slate-200 pb-2 text-base font-semibold text-slate-900">
            Zone: {printModel.systemTitle}
          </h2>
          <QuoteSummaryPrintable items={printModel.flatItems} />
        </section>
      )}

      <section className="mt-6 border-t border-slate-300 pt-4">
        <div className="ml-auto w-full max-w-xs space-y-1 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-600">
              {isProjectLayout ? "Project subtotal" : "Zone subtotal"}
            </span>
            <span className="font-semibold">{formatSek(grandSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>VAT</span>
            <span>VAT excluded (not included in totals)</span>
          </div>
          <div className="flex items-center justify-between border-t border-slate-300 pt-2 text-base">
            <span className="font-semibold">
              {isProjectLayout ? "Project grand total" : "Zone total"}
            </span>
            <span className="font-bold">{formatSek(grandSubtotal)}</span>
          </div>
        </div>
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-3 text-xs text-slate-500">
        Generated by ENSTO Sales Tool
      </footer>

      <div className="no-print mt-6 flex justify-end">
        <button
          type="button"
          className="rounded border border-slate-300 bg-white px-3 py-1.5 text-sm hover:bg-slate-50"
          onClick={() => window.print()}
        >
          {isProjectLayout ? "Print / Save Project PDF" : "Print / Save PDF"}
        </button>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-slate-500">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}
