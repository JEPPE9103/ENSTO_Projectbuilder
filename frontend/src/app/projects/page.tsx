"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";

export default function ProjectsPage() {
  const router = useRouter();
  const { data: projects, isLoading, isError } = useProjects();
  const count = projects?.length ?? 0;

  function goToProject(id: number) {
    router.push(`/projects/${id}`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6 border-b border-[#E2E8F0] pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Projects
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
            Projects
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            Every row opens the full workspace — systems, pricing, and quote tools on
            the right.
          </p>
          {!isLoading && !isError && (
            <p className="mt-4 inline-flex items-center rounded-xl border border-[#E2E8F0] bg-white px-3 py-1.5 text-sm font-medium text-slate-600 shadow-sm">
              <span className="tabular-nums text-lg font-bold text-slate-900">{count}</span>
              <span className="ml-2">
                {count === 1 ? "project" : "projects"}
              </span>
            </p>
          )}
        </div>
        <Link href="/projects/new" className="shrink-0">
          <Button className="min-h-12 w-full px-8 text-base sm:w-auto">
            Create project
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-surface transition-all duration-150 hover:shadow-surface-hover">
        {isLoading && (
          <p className="px-5 py-4 text-sm text-slate-500">Loading projects…</p>
        )}
        {isError && (
          <p className="px-5 py-4 text-sm text-red-600">
            Could not load projects. Please try again.
          </p>
        )}
        {!isLoading && projects && projects.length === 0 && (
          <div className="px-6 py-14 text-center">
            <p className="text-base font-semibold text-slate-800">No projects yet</p>
            <p className="mt-2 text-sm text-slate-600">
              Create your first project to start building a quotation.
            </p>
            <div className="mt-6">
              <Link href="/projects/new">
                <Button className="rounded-xl px-6">Create project</Button>
              </Link>
            </div>
          </div>
        )}
        {!isLoading && projects && projects.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-[#E2E8F0] bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Customer</th>
                  <th className="px-6 py-3">Country</th>
                  <th className="px-6 py-3">Type</th>
                  <th className="px-6 py-3 text-right">Updated</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    aria-label={`Open project ${p.name}`}
                    onClick={() => goToProject(p.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        goToProject(p.id);
                      }
                    }}
                    className="cursor-pointer border-b border-slate-100 transition-all duration-150 last:border-0 hover:bg-slate-50/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                  >
                    <td className="px-6 py-4">
                      <span className="font-semibold text-slate-900 group-hover:text-blue-800">
                        {p.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700">{p.customer_name}</td>
                    <td className="px-6 py-4 text-slate-700">{p.country}</td>
                    <td className="px-6 py-4 text-slate-700">{p.project_type}</td>
                    <td className="px-6 py-4 text-right text-xs tabular-nums text-slate-500">
                      {new Date(p.updated_at ?? p.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
