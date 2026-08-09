import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { ROLE_LABELS } from "@/lib/constants";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({
    include: { businessUnit: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Users" description="Enterprise users participating in AI governance workflows." />
      <DataTable
        rows={users}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Name", cell: (r) => r.name },
          { key: "email", header: "Email", cell: (r) => r.email },
          { key: "title", header: "Title", cell: (r) => r.title ?? "—" },
          { key: "role", header: "Role", cell: (r) => ROLE_LABELS[r.role] },
          { key: "bu", header: "Business Unit", cell: (r) => r.businessUnit?.name ?? "—" },
          {
            key: "active",
            header: "Status",
            cell: (r) => <StatusBadge status={r.active ? "ACTIVE" : "INACTIVE"} />,
          },
        ]}
      />
    </div>
  );
}
