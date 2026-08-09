import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function ControlLibraryAdminPage() {
  const controls = await prisma.control.findMany({
    include: { owner: true },
    orderBy: { controlId: "asc" },
  });

  return (
    <div>
      <PageHeader title="Control Library" description="Canonical AI governance controls and testing expectations." />
      <DataTable
        rows={controls}
        rowKey={(r) => r.id}
        columns={[
          { key: "id", header: "Control ID", cell: (r) => r.controlId },
          { key: "name", header: "Control Name", cell: (r) => r.name },
          {
            key: "req",
            header: "Requirement",
            className: "max-w-lg whitespace-normal",
            cell: (r) => r.requirement,
          },
          { key: "owner", header: "Control Owner", cell: (r) => r.owner?.name ?? "—" },
          { key: "risk", header: "Applicable Risk Level", cell: (r) => <RiskBadge level={r.applicableRiskLevel} /> },
          { key: "freq", header: "Testing Frequency", cell: (r) => r.testingFrequency },
          { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        ]}
      />
    </div>
  );
}
