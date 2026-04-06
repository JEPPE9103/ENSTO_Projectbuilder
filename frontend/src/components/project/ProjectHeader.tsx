import { Button } from "@/components/ui";
import type { Project } from "@/lib/api-types";

export type WorkspaceStatus =
  | { mode: "new-system" }
  | { mode: "editing"; systemName: string }
  | { mode: "selected"; systemName: string };

type ProjectHeaderProps = {
  project: Project;
  onDeleteProject: () => void;
  isDeleting: boolean;
  status?: { label: string; detail?: string; tone?: "neutral" | "success" | "warning" };
  /** @deprecated use workspaceStatus — kept for minimal callers */
  activeSystemName?: string | null;
  workspaceStatus?: WorkspaceStatus | null;
};

export function ProjectHeader({
  project,
  onDeleteProject,
  isDeleting,
  status,
  activeSystemName,
  workspaceStatus,
}: ProjectHeaderProps) {
  const resolvedWorkspace =
    workspaceStatus ??
    (activeSystemName
      ? ({ mode: "selected", systemName: activeSystemName } satisfies WorkspaceStatus)
      : null);
  const toneClass =
    status?.tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : status?.tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : "border-slate-200 bg-slate-50 text-slate-700";
  return (
    <header className="border-b border-[#E2E8F0] pb-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Project
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {project.name}
          </h1>
          {resolvedWorkspace && (
            <p className="mt-3 inline-flex flex-wrap items-center gap-2 text-sm text-slate-600">
              {resolvedWorkspace.mode === "new-system" && (
                <>
                  <span className="rounded-xl border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-blue-800">
                    New system
                  </span>
                  <span className="text-slate-700">
                    Add a name and products, then save — this will not overwrite existing
                    systems.
                  </span>
                </>
              )}
              {resolvedWorkspace.mode === "editing" && (
                <>
                  <span className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Editing system
                  </span>
                  <span className="font-semibold text-slate-900">
                    {resolvedWorkspace.systemName}
                  </span>
                </>
              )}
              {resolvedWorkspace.mode === "selected" && (
                <>
                  <span className="rounded-xl border border-[#E2E8F0] bg-slate-50 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
                    Working on
                  </span>
                  <span className="font-semibold text-slate-900">
                    {resolvedWorkspace.systemName}
                  </span>
                </>
              )}
            </p>
          )}
          <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
            <div>
              <dt className="sr-only">Customer</dt>
              <dd>{project.customer_name}</dd>
            </div>
            <div className="text-slate-300" aria-hidden>
              ·
            </div>
            <div>
              <dt className="sr-only">Location</dt>
              <dd>{project.country}</dd>
            </div>
            <div className="text-slate-300" aria-hidden>
              ·
            </div>
            <div>
              <dt className="sr-only">Type</dt>
              <dd>{project.project_type}</dd>
            </div>
          </dl>
          {status && (
            <div className="mt-4 inline-flex flex-wrap items-center gap-2 rounded-2xl border border-[#E2E8F0] bg-white px-3 py-2 text-xs font-medium shadow-sm transition-shadow duration-150 hover:shadow-md sm:text-[13px]">
              <span className={`rounded-lg border px-2.5 py-0.5 ${toneClass}`}>
                {status.label}
              </span>
              {status.detail && (
                <span className="text-slate-500">{status.detail}</span>
              )}
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="shrink-0 self-start rounded-xl transition-all duration-150 hover:scale-[1.01]"
          onClick={onDeleteProject}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting…" : "Delete project"}
        </Button>
      </div>
    </header>
  );
}
