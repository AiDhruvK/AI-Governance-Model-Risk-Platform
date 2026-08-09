"use client";

import { Menu, Search, Bell } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent } from "react";

const roles = Object.keys(ROLE_LABELS) as UserRole[];

export function AppHeader({
  currentRole,
  userName,
  menuOpen,
  onMenuClick,
}: {
  currentRole: UserRole;
  userName: string;
  menuOpen: boolean;
  onMenuClick: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  function switchRole(role: string) {
    document.cookie = `aigov_role=${role}; path=/; max-age=31536000`;
    startTransition(() => router.refresh());
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchQuery.trim();
    router.push(query ? `/inventory?q=${encodeURIComponent(query)}` : "/inventory");
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur">
      <button
        type="button"
        onClick={onMenuClick}
        className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 lg:hidden"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        aria-controls="platform-navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      <form onSubmit={submitSearch} className="hidden min-w-0 flex-1 md:block" role="search">
        <div className="relative max-w-xl">
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search AI systems, issues, controls..."
            aria-label="Search AI systems, issues, and controls"
            className="w-full rounded-md border border-slate-200 bg-slate-50 py-1.5 pl-3 pr-10 text-sm outline-none focus:border-teal-700 focus:bg-white focus:ring-1 focus:ring-teal-700"
          />
          <button
            type="submit"
            aria-label="Submit search"
            className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded text-slate-500 hover:bg-slate-200 hover:text-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Search className="h-4 w-4" />
          </button>
        </div>
      </form>

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
