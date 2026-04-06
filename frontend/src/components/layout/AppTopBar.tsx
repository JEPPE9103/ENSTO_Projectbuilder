"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

function titleCaseSegment(segment: string): string {
  if (segment === "new") return "New project";
  if (/^\d+$/.test(segment)) return "Workspace";
  return segment.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function AppTopBar() {
  const pathname = usePathname() ?? "";

  const segments = pathname.split("/").filter(Boolean);
  const pageTitle =
    pathname === "/" || pathname === ""
      ? "Dashboard"
      : pathname.startsWith("/products")
        ? "Product Finder"
        : pathname.startsWith("/projects/new")
          ? "New project"
          : pathname.match(/^\/projects\/\d+$/)
            ? "Project workspace"
            : pathname.startsWith("/projects")
              ? "Projects"
              : "ENSTO Sales Tool";

  return (
    <header className="flex shrink-0 items-center justify-between gap-4 border-b border-slate-200/90 bg-white/95 px-5 py-3.5 shadow-[0_1px_0_0_rgb(15_23_42_/_0.04)] backdrop-blur-md lg:px-6 print:hidden">
      <div className="min-w-0 flex-1">
        <nav className="text-xs text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link
                href="/"
                className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
              >
                Home
              </Link>
            </li>
            {segments.length > 0 && (
              <>
                <span className="text-slate-300" aria-hidden>
                  /
                </span>
                {segments.map((seg, i) => {
                  const href = `/${segments.slice(0, i + 1).join("/")}`;
                  const isLast = i === segments.length - 1;
                  const label = titleCaseSegment(seg);
                  return (
                    <li key={href} className="flex items-center gap-1.5">
                      {isLast ? (
                        <span className="font-medium text-slate-600">{label}</span>
                      ) : (
                        <>
                          <Link
                            href={href}
                            className="transition-colors hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-1"
                          >
                            {label}
                          </Link>
                          <span className="text-slate-300" aria-hidden>
                            /
                          </span>
                        </>
                      )}
                    </li>
                  );
                })}
              </>
            )}
          </ol>
        </nav>
        <h1 className="mt-1.5 truncate text-xl font-semibold tracking-tight text-slate-900">
          {pageTitle}
        </h1>
      </div>
      <div
        className="hidden shrink-0 items-center gap-2 sm:flex"
        aria-hidden="true"
      >
        <div
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/80 text-slate-400 transition-all duration-150 hover:border-slate-300/90 hover:bg-white"
          title="Search (placeholder)"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            aria-hidden
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
        </div>
        <div
          className="h-9 w-9 rounded-full border border-slate-200/90 bg-slate-100"
          title="Profile (placeholder)"
        />
      </div>
    </header>
  );
}
