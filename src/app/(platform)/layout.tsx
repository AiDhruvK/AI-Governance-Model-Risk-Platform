import { PlatformShell } from "@/components/layout/PlatformShell";
import { getCurrentSession } from "@/lib/auth";

export default async function PlatformLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();

  return (
    <PlatformShell role={session.role} userName={session.user?.name ?? "Governance User"}>
      {children}
    </PlatformShell>
  );
}
