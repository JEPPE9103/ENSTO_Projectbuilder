"use client";

import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M6 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  const stats = useMemo(() => {
    if (!projects?.length) {
      return {
        total: 0,
        lastUpdated: null as { name: string; id: number; at: string } | null,
      };
    }
    let latest: { name: string; id: number; at: string } | null = null;
    for (const p of projects) {
      const at = p.updated_at ?? p.created_at;
      if (!latest || new Date(at) > new Date(latest.at)) {
        latest = { name: p.name, id: p.id, at };
      }
    }
    return { total: projects.length, lastUpdated: latest };
  }, [projects]);

  const recentProjects = useMemo(
    () =>
      (projects ?? [])
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updated_at ?? b.created_at).getTime() -
            new Date(a.updated_at ?? a.created_at).getTime(),
        )
        .slice(0, 3),
    [projects],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover sm:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-2xl">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Resume your work
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Open a project to configure systems and pricing, or explore the catalog
              for articles. Everything you need for estimates and quotes lives in{" "}
              <span className="font-medium text-slate-800">Projects</span>.
            </p>
            {!isLoading && recentProjects.length > 0 && (
              <div className="mt-5 space-y-3">
                {recentProjects.map((p) => (
                  <Link
                    key={p.id}
                    href={`/projects/${p.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-slate-50"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {p.customer_name} · {p.project_type} ·{" "}
                        {new Date(p.updated_at ?? p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs font-medium text-slate-600">Open</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link href="/projects/new" className="shrink-0">
            <Button className="min-h-12 w-full min-w-[220px] px-8 text-base sm:w-auto">
              Create project
            </Button>
          </Link>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <h3 className="text-lg font-semibold text-slate-900">At a glance</h3>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Projects
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-slate-900">
              {isLoading ? "—" : stats.total}
            </p>
            <p className="mt-2 text-sm text-slate-600">In your library</p>
          </div>
          <div className="rounded-2xl border border-slate-200/90 bg-white px-5 py-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover sm:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Last updated
            </p>
            {isLoading && <p className="mt-2 text-sm text-slate-500">Loading…</p>}
            {!isLoading && stats.lastUpdated && (
              <div className="mt-2">
                <Link
                  href={`/projects/${stats.lastUpdated.id}`}
                  className="text-base font-semibold text-slate-900 transition-colors hover:text-blue-700"
                >
                  {stats.lastUpdated.name}
                </Link>
                <p className="mt-0.5 text-xs text-slate-500">
                  {new Date(stats.lastUpdated.at).toLocaleString()}
                </p>
              </div>
            )}
            {!isLoading && !stats.lastUpdated && (
              <p className="mt-2 text-sm text-slate-600">
                No projects yet — create one to start building a quotation.
              </p>
            )}
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Line counts and BOM totals appear in each project&apos;s workspace panel.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-2xl border border-slate-200/90 bg-white px-6 py-6 shadow-surface transition-all duration-150 hover:shadow-surface-hover sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">Product Finder</p>
          <p className="mt-1 text-sm text-slate-600">
            Explore the catalog — building happens in Projects.
          </p>
        </div>
        <Link href="/products" className="shrink-0">
          <Button variant="secondary" className="min-h-11 w-full rounded-xl sm:w-auto">
            Open Product Finder
          </Button>
        </Link>
      </section>

      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">Recent projects</h3>
          {!isLoading && projects && projects.length > 5 && (
            <Link
              href="/projects"
              className="text-xs font-medium text-slate-600 transition-colors hover:text-blue-700"
            >
              View all
            </Link>
          )}
        </div>
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-surface transition-all duration-150 hover:shadow-surface-hover">
          {isLoading && (
            <p className="px-5 py-4 text-sm text-slate-500">Loading projects…</p>
          )}
          {!isLoading && projects && projects.length === 0 && (
            <div className="px-6 py-12 text-center">
              <p className="text-base font-semibold text-slate-800">Start your first project</p>
              <p className="mt-2 text-sm text-slate-600">
                Create a project, save a named system, then generate a quotation or PDF.
              </p>
              <div className="mt-6">
                <Link href="/projects/new">
                  <Button className="rounded-xl px-6">Create project</Button>
                </Link>
              </div>
            </div>
          )}
          {!isLoading && projects && projects.length > 0 && (
            <ul className="divide-y divide-slate-100">
              {projects.slice(0, 8).map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/projects/${p.id}`}
                    className="group flex items-center justify-between gap-4 px-5 py-4 transition-all duration-150 hover:bg-slate-50/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600 sm:px-6"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-semibold text-slate-900 group-hover:text-blue-800">
                        {p.name}
                      </div>
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {p.customer_name} · {p.country} · {p.project_type}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className="text-xs tabular-nums text-slate-400 group-hover:text-slate-500">
                        {new Date(p.updated_at ?? p.created_at).toLocaleDateString()}
                      </span>
                      <ChevronRight className="text-slate-300 transition-colors group-hover:text-blue-600" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
