import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";

export const dynamic = "force-dynamic";

export default async function AssessmentQuestionsAdminPage() {
  const questions = await prisma.assessmentQuestion.findMany({ orderBy: [{ section: "asc" }, { sortOrder: "asc" }] });

  return (
    <div>
      <PageHeader
        title="Assessment Questions"
        description="Weighted questionnaire used by the AI risk assessment workflow."
      />
      <DataTable
        rows={questions}
        rowKey={(r) => r.id}
        columns={[
          { key: "section", header: "Section", cell: (r) => r.section },
          {
            key: "question",
            header: "Question",
            className: "max-w-xl whitespace-normal",
            cell: (r) => r.question,
          },
          { key: "weight", header: "Weight", cell: (r) => r.weight },
          { key: "order", header: "Sort Order", cell: (r) => r.sortOrder },
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
