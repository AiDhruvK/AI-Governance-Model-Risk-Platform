import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";

export const dynamic = "force-dynamic";

export default async function RiskCategoriesAdminPage() {
  const categories = await prisma.riskCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Risk Categories" description="Risk dimensions used in system assessments and scoring." />
      <DataTable
        rows={categories}
        rowKey={(r) => r.id}
        columns={[
          { key: "name", header: "Category", cell: (r) => r.name },
          { key: "desc", header: "Description", className: "whitespace-normal", cell: (r) => r.description ?? "—" },
          { key: "weight", header: "Weight", cell: (r) => r.weight.toFixed(1) },
        ]}
      />
    </div>
  );
}
