import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export const dynamic = "force-dynamic";

export default async function AITypesAdminPage() {
  const types = await prisma.aIType.findMany({
    include: { _count: { select: { aiSystems: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="AI Types" description="Classification taxonomy for inventory and reporting." />
      <DataTable
        rows={types}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "AI Type", cell: (r) => r.name },
          { key: "desc", header: "Description", className: "whitespace-normal", cell: (r) => r.description ?? "—" },
          { key: "count", header: "Systems", cell: (r) => r._count.aiSystems },
        ]}
      />
    </div>
  );
}
