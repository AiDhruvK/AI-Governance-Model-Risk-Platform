"use client";

import { Menu, Search, Bell } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

const roles = Object.keys(ROLE_LABELS) as UserRole[];

export function AppHeader({
  currentRole,
  userName,
  onMenuClick,
}: {
  currentRole: UserRole;
  userName: string;
  onMenuClick?: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function switchRole(role: string) {
    document.cookie = `aigov_role=${role}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onMenuClick}
        className="rounded-md border border-slate-200 p-1.5 text-slate-600 lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-4 w-4" />
      </button>

      <div className="relative hidden min-w-0 flex-1 md:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search AI systems, issues, controls..."
          className="w-full max-w-xl rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              const value = (e.target as HTMLInputElement).value;
              router.push(`/inventory?q=${encodeURIComponent(value)}`);
            }
          }}
        />
      </div>

      <div className={`ml-auto flex items-center gap-3 ${pending ? "opacity-70" : ""}`}>
        <button type="button" className="rounded-md border border-slate-200 p-1.5 text-slate-500" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </button>
        <label className="hidden text-xs text-slate-500 sm:block">
          Role
          <select
            value={currentRole}
            onChange={(e) => switchRole(e.target.value)}
            className="ml-2 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-800"
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </label>
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-800">{userName}</p>
          <p className="text-[11px] text-slate-500">{ROLE_LABELS[currentRole]}</p>
        </div>
      </div>
    </header>
  );
}
