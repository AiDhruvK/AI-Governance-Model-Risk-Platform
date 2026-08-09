"use client";

import { useEffect, useState } from "react";
import type { UserRole } from "@prisma/client";
import { AppSidebar } from "./AppSidebar";
import { AppHeader } from "./AppHeader";

export function PlatformShell({
  children,
  role,
  userName,
}: {
  children: React.ReactNode;
  role: UserRole;
  userName: string;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader
          currentRole={role}
          userName={userName}
          menuOpen={mobileOpen}
          onMenuClick={() => setMobileOpen((open) => !open)}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
