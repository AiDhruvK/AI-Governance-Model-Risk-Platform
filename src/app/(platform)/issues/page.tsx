import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { formatDate, isOverdue, titleCase } from "@/lib/utils";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function IssuesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const severity = typeof params.severity === "string" ? params.severity : "";
  const status = typeof params.status === "string" ? params.status : "";

  const issues = await prisma.issue.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { issueId: { contains: q, mode: "insensitive" } },
                { title: { contains: q, mode: "insensitive" } },
                { aiSystem: { name: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
        severity ? { severity: severity as never } : {},
        status ? { status: status as never } : {},
      ],
    },
    include: { aiSystem: true, owner: true },
    orderBy: [{ severity: "asc" }, { dueDate: "asc" }],
  });

  const openCount = issues.filter((i) => i.status !== "CLOSED").length;
  const overdueCount = issues.filter((i) => i.status !== "CLOSED" && isOverdue(i.dueDate)).length;
  const criticalCount = issues.filter((i) => i.severity === "CRITICAL" && i.status !== "CLOSED").length;

  return (
    <div>
      <PageHeader
        title="Governance Issues"
        description="Track remediation of AI governance findings, control failures, and compliance gaps."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Open Issues" value={openCount} tone="warning" />
        <KpiCard label="Overdue Issues" value={overdueCount} tone="danger" />
        <KpiCard label="Open Critical" value={criticalCount} tone="danger" />
      </div>

      <Suspense fallback={null}>
        <FilterBar
          searchPlaceholder="Search issues..."
          filters={[
            {
              key: "severity",
              label: "Severity",
              options: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((v) => ({ value: v, label: titleCase(v) })),
            },
            {
              key: "status",
              label: "Status",
              options: ["OPEN", "IN_PROGRESS", "PENDING_VALIDATION", "CLOSED"].map((v) => ({
                value: v,
                label: titleCase(v),
              })),
            },
          ]}
        />
      </Suspense>

      <DataTable
        rows={issues}
        rowKey={(row) => row.id}
        onRowHref={(row) => `/inventory/${row.aiSystemId}`}
        columns={[
          {
            key: "id",
            header: "Issue ID",
            cell: (row) => (
              <span className={row.status !== "CLOSED" && isOverdue(row.dueDate) ? "font-semibold text-red-700" : ""}>
                {row.issueId}
              </span>
            ),
          },
          { key: "system", header: "AI System", cell: (row) => row.aiSystem.name },
          {
            key: "title",
            header: "Issue Title",
            className: "max-w-sm whitespace-normal",
            cell: (row) => row.title,
          },
          { key: "severity", header: "Severity", cell: (row) => <RiskBadge level={row.severity} /> },
          { key: "category", header: "Category", cell: (row) => row.category },
          { key: "owner", header: "Owner", cell: (row) => row.owner?.name ?? "—" },
          { key: "identified", header: "Date Identified", cell: (row) => formatDate(row.dateIdentified) },
          {
            key: "due",
            header: "Due Date",
            cell: (row) => (
              <span className={row.status !== "CLOSED" && isOverdue(row.dueDate) ? "font-semibold text-red-700" : ""}>
                {formatDate(row.dueDate)}
                {row.status !== "CLOSED" && isOverdue(row.dueDate) ? " · Overdue" : ""}
              </span>
            ),
          },
          { key: "status", header: "Status", cell: (row) => <StatusBadge status={row.status} /> },
          {
            key: "plan",
            header: "Remediation Plan",
            className: "max-w-xs whitespace-normal",
            cell: (row) => row.remediationPlan ?? "—",
          },
        ]}
      />
    </div>
  );
}
