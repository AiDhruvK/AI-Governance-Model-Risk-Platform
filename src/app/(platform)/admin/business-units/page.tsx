import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export const dynamic = "force-dynamic";

export default async function BusinessUnitsAdminPage() {
  const units = await prisma.businessUnit.findMany({
    include: { _count: { select: { users: true, aiSystems: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Business Units" description="Organizational units used for ownership and reporting." />
      <DataTable
        rows={units}
        rowKey={(r) => r.id}
        columns={[
          { key: "code", header: "Code", cell: (r) => r.code },
          { key: "name", header: "Name", cell: (r) => r.name },
          { key: "desc", header: "Description", className: "whitespace-normal", cell: (r) => r.description ?? "—" },
          { key: "users", header: "Users", cell: (r) => r._count.users },
          { key: "systems", header: "AI Systems", cell: (r) => r._count.aiSystems },
        ]}
      />
    </div>
  );
}
