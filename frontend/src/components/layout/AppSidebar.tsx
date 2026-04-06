"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutIcon },
  { href: "/projects", label: "Projects", icon: FolderIcon },
  { href: "/products", label: "Product Finder", icon: SearchIcon },
] as const;

export function AppSidebar({
  onNavigate,
  className = "",
}: {
  onNavigate?: () => void;
  className?: string;
}) {
  const pathname = usePathname() ?? "";

  return (
    <div className={`flex h-full flex-col ${className}`}>
      <Link
        href="/"
        onClick={onNavigate}
        className="mb-8 flex items-center gap-3 rounded-xl px-2 py-1.5 outline-none transition-all duration-150 hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <div className="h-9 w-9 shrink-0 rounded-xl bg-blue-600 shadow-surface" />
        <div className="min-w-0">
          <div className="text-sm font-semibold tracking-tight text-white">
            ENSTO Sales
          </div>
          <div className="truncate text-xs text-slate-400">Internal tool</div>
        </div>
      </Link>

      <nav className="flex flex-1 flex-col gap-1" aria-label="Main">
        {nav.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/" || pathname === ""
              : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A] ${
                active
                  ? "bg-blue-600 text-white shadow-md shadow-blue-950/40"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 shrink-0 ${active ? "text-white" : "opacity-80"}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function LayoutIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75A2.25 2.25 0 0115.75 18H18a2.25 2.25 0 002.25-2.25V15.75A2.25 2.25 0 0018 13.5h-2.25a2.25 2.25 0 00-2.25 2.25V15.75zM13.5 6A2.25 2.25 0 0115.75 3.75H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25A2.25 2.25 0 0113.5 8.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z"
      />
    </svg>
  );
}

function FolderIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
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
  );
}
