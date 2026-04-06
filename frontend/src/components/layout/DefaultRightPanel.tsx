"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { Button } from "@/components/ui";
import { useProjects } from "@/hooks/useProjects";

function RailHeader({ title, hint }: { title: string; hint: string }) {
  return (
    <header className="border-b border-slate-700/80 pb-4">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
        {title}
      </p>
      <p className="mt-1.5 text-xs leading-relaxed text-slate-400">{hint}</p>
    </header>
  );
}

function RailBody({ children }: { children: ReactNode }) {
  return <div className="space-y-3 pt-4">{children}</div>;
}

export function DefaultRightPanel() {
  const pathname = usePathname() ?? "";
  const isProjectWorkspace = /^\/projects\/\d+$/.test(pathname);
  const isDashboard = pathname === "/" || pathname === "";
  const isProjectsList = pathname === "/projects";
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const projectCount = projects?.length ?? 0;

  if (isProjectWorkspace) {
    return (
      <div className="space-y-4">
        <RailHeader
          title="Workspace"
          hint="Totals and actions load when your project is open."
        />
        <p className="text-xs text-slate-500">
          If this message persists, refresh the page.
        </p>
      </div>
    );
  }

  if (isDashboard) {
    return (
      <div className="space-y-6">
        <RailHeader
          title="Assistant"
          hint="Shortcuts and context for this screen."
        />
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/40 px-4 py-3 text-sm text-slate-300">
          {!projectsLoading && (
            <span className="font-semibold tabular-nums text-white">
              {projectCount}
            </span>
          )}
          {projectsLoading && <span className="text-slate-500">…</span>}
          {!projectsLoading && (
            <span>
              {" "}
              {projectCount === 1 ? "project" : "projects"} in your library
            </span>
          )}
        </div>
        <Link href="/projects/new" className="block">
          <Button className="h-12 w-full justify-center text-sm">
            Create project
          </Button>
        </Link>
        <Link
          href="/products"
          className="flex w-full items-center justify-center rounded-xl border border-slate-600/80 bg-transparent py-2.5 text-xs font-medium text-slate-300 transition-all duration-150 hover:border-slate-500 hover:bg-slate-800/50 hover:text-white"
        >
          Open Product Finder
        </Link>
      </div>
    );
  }

  if (pathname.startsWith("/projects/new")) {
    return (
      <div className="space-y-6">
        <RailHeader
          title="Assistant"
          hint="You’ll configure systems after this step."
        />
        <RailBody>
          <p className="text-xs leading-relaxed text-slate-400">
            Save the basics, then use{" "}
            <strong className="font-medium text-slate-200">Build System</strong> to
            add catalog lines and pricing.
          </p>
        </RailBody>
      </div>
    );
  }

  if (isProjectsList) {
    return (
      <div className="space-y-6">
        <RailHeader
          title="Assistant"
          hint="Open a row to work with live totals and quote tools."
        />
        <div className="rounded-2xl border border-slate-700/80 bg-slate-800/40 px-4 py-3 text-sm text-slate-300">
          <span className="font-semibold tabular-nums text-white">
            {projectsLoading ? "…" : projectCount}
          </span>
          <span className="text-slate-400">
            {" "}
            {projectCount === 1 ? "project" : "projects"} listed
          </span>
        </div>
        <Link href="/projects/new" className="block">
          <Button className="h-12 w-full justify-center text-sm">
            Create project
          </Button>
        </Link>
        <Link
          href="/products"
          className="flex w-full items-center justify-center rounded-xl border border-slate-600/80 py-2.5 text-xs font-medium text-slate-300 transition-all duration-150 hover:bg-slate-800/50 hover:text-white"
        >
          Browse catalog
        </Link>
      </div>
    );
  }

  if (pathname.startsWith("/products")) {
    return (
      <div className="space-y-6">
        <RailHeader
          title="Assistant"
          hint="Catalog is for exploration only."
        />
        <p className="text-xs leading-relaxed text-slate-400">
          Add lines to a BOM from{" "}
          <strong className="font-medium text-slate-200">Projects</strong> → open a
          project →{" "}
          <strong className="font-medium text-slate-200">Build System</strong>.
        </p>
        <Link href="/projects" className="block">
          <Button
            variant="secondary"
            className="h-11 w-full justify-center rounded-xl border-slate-600 bg-slate-800/50 font-medium text-slate-100 hover:bg-slate-800 hover:text-white"
          >
            Go to Projects
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RailHeader title="Assistant" hint="Pick a section in the sidebar." />
    </div>
  );
}
