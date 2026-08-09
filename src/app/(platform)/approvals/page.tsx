import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ApprovalWorkflow } from "@/components/ui/ApprovalWorkflow";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ApprovalsPage() {
  const systems = await prisma.aISystem.findMany({
    where: {
      OR: [
        { governanceStatus: { in: ["PENDING_REVIEW", "IN_ASSESSMENT", "CONDITIONAL"] } },
        { approvals: { some: { status: { in: ["PENDING", "CHANGES_REQUESTED"] } } } },
      ],
    },
    include: {
      businessUnit: true,
      approvals: { include: { reviewer: true }, orderBy: { sortOrder: "asc" } },
    },
    orderBy: { riskLevel: "asc" },
    take: 12,
  });

  const [pending, approved, changes, rejected] = await Promise.all([
    prisma.approval.count({ where: { status: "PENDING" } }),
    prisma.approval.count({ where: { status: "APPROVED" } }),
    prisma.approval.count({ where: { status: "CHANGES_REQUESTED" } }),
    prisma.approval.count({ where: { status: "REJECTED" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Approvals"
        description="Multi-stage AI approval workflow spanning business, technical, risk, privacy, security, legal, and final governance review."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pending Stages" value={pending} tone="warning" />
        <KpiCard label="Approved Stages" value={approved} tone="success" />
        <KpiCard label="Changes Requested" value={changes} tone="warning" />
        <KpiCard label="Rejected Stages" value={rejected} tone="danger" />
      </div>

      <div className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-slate-900">Standard Approval Stages</p>
        <ol className="mt-2 grid gap-2 text-sm text-slate-700 md:grid-cols-2 xl:grid-cols-4">
          {[
            "1. Business Owner Review",
            "2. Technical Review",
            "3. AI Risk Review",
            "4. Privacy Review",
            "5. Security Review",
            "6. Legal / Compliance Review",
            "7. Final Governance Approval",
          ].map((stage) => (
            <li key={stage} className="rounded border border-slate-100 bg-slate-50 px-3 py-2">
              {stage}
            </li>
          ))}
        </ol>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {systems.map((system) => (
          <Panel
            key={system.id}
            title={system.name}
            description={`${system.systemId} · ${system.businessUnit.name}`}
            actions={
              <div className="flex items-center gap-2">
                <RiskBadge level={system.riskLevel} />
                <StatusBadge status={system.governanceStatus} />
              </div>
            }
          >
            <ApprovalWorkflow approvals={system.approvals} />
            <div className="mt-3">
              <Link href={`/inventory/${system.id}`} className="text-sm font-medium text-teal-800 hover:underline">
                Open system profile
              </Link>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}
