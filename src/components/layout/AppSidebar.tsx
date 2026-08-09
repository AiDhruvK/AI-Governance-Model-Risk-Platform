"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  ShieldCheck,
  FlaskConical,
  AlertTriangle,
  GitPullRequest,
  FileBarChart,
  Settings,
  Shield,
  X,
} from "lucide-react";
import { APP_NAME, APP_SHORT, NAV_ITEMS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const icons = {
  LayoutDashboard,
  Boxes,
  ClipboardCheck,
  ShieldCheck,
  FlaskConical,
  AlertTriangle,
  GitPullRequest,
  FileBarChart,
  Settings,
};

export function AppSidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/40 lg:hidden",
          mobileOpen ? "block" : "hidden"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        id="platform-navigation"
        aria-label="Primary navigation"
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-900 text-slate-100 shadow-xl transition-transform duration-200 lg:static lg:translate-x-0 lg:shadow-none",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-teal-700">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">{APP_SHORT}</p>
              <p className="text-[11px] text-slate-400">Enterprise Model Risk</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-slate-300 hover:bg-slate-800 hover:text-white lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <p className="mt-3 hidden text-[11px] leading-snug text-slate-500 xl:block">{APP_NAME}</p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => {
            const Icon = icons[item.icon];
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                  active ? "bg-teal-800/80 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-800 px-4 py-3 text-[11px] text-slate-500">
          Contoso Financial Group · Internal Use
        </div>
      </aside>
    </>
  );
}
