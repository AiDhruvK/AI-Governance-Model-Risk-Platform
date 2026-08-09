import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { SystemDetailTabs } from "@/components/inventory/SystemDetailTabs";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AISystemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const system = await prisma.aISystem.findUnique({
    where: { id },
    include: {
      aiType: true,
      businessUnit: true,
      businessOwner: true,
      technicalOwner: true,
      assessments: { orderBy: { updatedAt: "desc" }, take: 1 },
      controlAssessments: {
        include: { control: true, tester: true },
        orderBy: { control: { controlId: "asc" } },
      },
      tests: { include: { tester: true }, orderBy: { testDate: "desc" } },
      issues: { include: { owner: true }, orderBy: { dateIdentified: "desc" } },
      approvals: { include: { reviewer: true }, orderBy: { sortOrder: "asc" } },
      auditEvents: { include: { actor: true }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!system) notFound();

  return (
    <div>
      <PageHeader
        title={system.name}
        description={`${system.systemId} · Governance profile and model risk record`}
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge status={system.governanceStatus} />
            <Link
              href="/inventory"
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
            >
              Back to Inventory
            </Link>
          </div>
        }
      />
      <SystemDetailTabs data={system} />
    </div>
  );
}
