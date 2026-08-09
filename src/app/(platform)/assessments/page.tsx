import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AssessmentsPage() {
  const session = await getCurrentSession();
  const assessments = await prisma.riskAssessment.findMany({
    include: {
      aiSystem: { include: { businessUnit: true } },
      lead: true,
    },
    orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
  });

  return (
    <div>
      <PageHeader
        title="Risk Assessments"
        description="Structured AI risk assessments across business impact, data, model, security, and compliance factors."
        actions={
          session.permissions.canEdit ? (
            <Link
              href="/assessments/new"
              className="rounded-md bg-teal-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-900"
            >
              New Assessment
            </Link>
          ) : null
        }
      />
      <DataTable
        rows={assessments}
        rowKey={(row) => row.id}
        onRowHref={(row) => `/assessments/${row.id}`}
        columns={[
          { key: "system", header: "AI System", cell: (row) => row.aiSystem.name },
          { key: "bu", header: "Business Unit", cell: (row) => row.aiSystem.businessUnit.name },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          { key: "score", header: "Score", cell: (row) => `${row.overallScore}/100` },
          { key: "risk", header: "Risk Level", cell: (row) => <RiskBadge level={row.riskLevel} /> },
          { key: "lead", header: "Lead", cell: (row) => row.lead?.name ?? "—" },
          { key: "due", header: "Due Date", cell: (row) => formatDate(row.dueDate) },
          { key: "completed", header: "Completed", cell: (row) => formatDate(row.completedAt) },
        ]}
      />
    </div>
  );
}
