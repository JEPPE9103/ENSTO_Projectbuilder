"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppShellProvider, useAppShell } from "@/components/layout/AppShellContext";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { DefaultRightPanel } from "@/components/layout/DefaultRightPanel";
import { ToastProvider } from "@/components/feedback/ToastProvider";

function AppShellInner({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "";
  const { rightPanel } = useAppShell();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const isPrintRoute = pathname.includes("/quote-print");
  const isProjectWorkspaceRoute = /^\/projects\/\d+$/.test(pathname);

  if (isPrintRoute) {
    return <>{children}</>;
  }

  return (
    <div className="desktop-app-scale flex h-screen min-h-screen flex-col overflow-hidden bg-[#F8FAFC]">
      <header className="flex items-center justify-between border-b border-[#E2E8F0] bg-white px-4 py-3 shadow-sm lg:hidden print:hidden">
        <Link
          href="/"
          className="flex items-center gap-2 rounded-xl outline-none transition-transform duration-150 hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-blue-600"
          onClick={() => setMobileNavOpen(false)}
        >
          <div className="h-8 w-8 rounded-xl bg-blue-600 shadow-surface" />
          <span className="text-sm font-semibold text-slate-900">ENSTO Sales</span>
        </Link>
        <button
          type="button"
          className="rounded-xl border border-[#E2E8F0] bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-expanded={mobileNavOpen}
          aria-controls="app-sidebar"
          onClick={() => setMobileNavOpen((o) => !o)}
        >
          Menu
        </button>
      </header>

      {mobileNavOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileNavOpen(false)}
        />
      )}

      <div className="flex min-h-0 flex-1 flex-col md:flex-row md:items-stretch print:flex-col">
        <aside
          id="app-sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-[252px] border-r border-slate-800/80 bg-[#0F172A] p-5 shadow-xl transition-transform duration-200 ease-out print:hidden lg:static lg:z-0 lg:h-full lg:w-60 lg:shrink-0 lg:overflow-y-auto lg:shadow-none ${
            mobileNavOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <AppSidebar onNavigate={() => setMobileNavOpen(false)} />
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col md:flex-row md:items-stretch">
          <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F8FAFC] print:bg-white">
            <div className="flex-1 min-h-0 overflow-y-auto">
              <AppTopBar />
              <div
                className={`py-5 print:px-0 print:py-0 lg:py-7 ${
                  isProjectWorkspaceRoute
                    ? "px-4 sm:px-5 lg:px-5 lg:py-7 xl:px-6"
                    : "px-5 sm:px-6 lg:px-6 lg:py-7 xl:px-8"
                }`}
              >
                <div className="mx-auto w-full max-w-[1560px]">
                  {children}
                </div>
              </div>
            </div>
          </main>

          <aside
            className="h-full w-full self-stretch shrink-0 border-t border-slate-800 bg-[#0F172A] px-4 py-5 text-slate-300 print:hidden sm:px-4 md:h-full md:w-[340px] md:basis-[340px] md:border-l md:border-t-0 md:border-slate-800 md:overflow-y-auto xl:w-[352px] xl:basis-[352px]"
            aria-label="Quote companion"
          >
            {rightPanel ?? <DefaultRightPanel />}
          </aside>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AppShellProvider>
        <AppShellInner>{children}</AppShellInner>
      </AppShellProvider>
    </ToastProvider>
  );
}
