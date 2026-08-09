import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterBar } from "@/components/ui/FilterBar";
import { formatDate, titleCase } from "@/lib/utils";
import { BusinessUnitBarChart } from "@/components/charts/SimpleCharts";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReportsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const unit = typeof params.unit === "string" ? params.unit : "";
  const report = typeof params.report === "string" ? params.report : "high-risk";

  const units = await prisma.businessUnit.findMany({ orderBy: { name: "asc" } });
  const unitFilter = unit ? { businessUnitId: unit } : {};

  const [
    highRisk,
    missingAssessments,
    criticalIssues,
    failedControls,
    upcomingReviews,
    missingApprovals,
    systemsForScores,
  ] = await Promise.all([
    prisma.aISystem.findMany({
      where: { riskLevel: { in: ["HIGH", "CRITICAL"] }, ...unitFilter },
      include: { businessUnit: true, businessOwner: true },
      orderBy: { riskLevel: "asc" },
    }),
    prisma.aISystem.findMany({
      where: {
        OR: [{ lastAssessmentAt: null }, { assessments: { some: { status: { in: ["NOT_STARTED", "OVERDUE"] } } } }],
        ...unitFilter,
      },
      include: { businessUnit: true, assessments: { take: 1, orderBy: { updatedAt: "desc" } } },
    }),
    prisma.issue.findMany({
      where: {
        severity: "CRITICAL",
        status: { not: "CLOSED" },
        ...(unit ? { aiSystem: { businessUnitId: unit } } : {}),
      },
      include: { aiSystem: true, owner: true },
    }),
    prisma.aIControlAssessment.findMany({
      where: {
        effectiveness: "INEFFECTIVE",
        ...(unit ? { aiSystem: { businessUnitId: unit } } : {}),
      },
      include: { control: true, aiSystem: { include: { businessUnit: true } } },
    }),
    prisma.aISystem.findMany({
      where: {
        nextReviewAt: { lte: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000) },
        ...unitFilter,
      },
      include: { businessUnit: true },
      orderBy: { nextReviewAt: "asc" },
    }),
    prisma.aISystem.findMany({
      where: {
        approvals: { some: { status: { in: ["PENDING", "CHANGES_REQUESTED"] } } },
        ...unitFilter,
      },
      include: {
        businessUnit: true,
        approvals: { where: { status: { in: ["PENDING", "CHANGES_REQUESTED"] } } },
      },
    }),
    prisma.aISystem.findMany({
      where: unitFilter,
      include: { businessUnit: true },
    }),
  ]);

  const scoreByUnitMap = new Map<string, { total: number; count: number }>();
  const riskByUnitMap = new Map<string, number>();
  for (const system of systemsForScores) {
    const key = system.businessUnit.name;
    const scoreEntry = scoreByUnitMap.get(key) ?? { total: 0, count: 0 };
    scoreEntry.total += system.governanceScore;
    scoreEntry.count += 1;
    scoreByUnitMap.set(key, scoreEntry);
    if (system.riskLevel === "HIGH" || system.riskLevel === "CRITICAL") {
      riskByUnitMap.set(key, (riskByUnitMap.get(key) ?? 0) + 1);
    }
  }

  const governanceScoreByUnit = Array.from(scoreByUnitMap.entries()).map(([name, v]) => ({
    name,
    value: Math.round(v.total / v.count),
  }));
  const riskByUnit = Array.from(riskByUnitMap.entries()).map(([name, value]) => ({ name, value }));

  return (
    <div>
      <PageHeader
        title="Reports"
        description="Governance reporting for executives, risk leaders, auditors, and control owners."
      />

      <Suspense fallback={null}>
        <FilterBar
          searchPlaceholder="Filter keyword..."
          filters={[
            {
              key: "report",
              label: "Report",
              options: [
                { value: "high-risk", label: "High-Risk AI Systems" },
                { value: "missing-assessments", label: "Missing Assessments" },
                { value: "critical-issues", label: "Open Critical Issues" },
                { value: "failed-controls", label: "Failed Controls" },
                { value: "upcoming-reviews", label: "Upcoming Governance Reviews" },
                { value: "missing-approvals", label: "Missing Required Approvals" },
                { value: "score-by-unit", label: "Governance Score by Business Unit" },
                { value: "risk-by-unit", label: "AI Risk by Business Unit" },
              ],
            },
            {
              key: "unit",
              label: "Business Unit",
              options: units.map((u) => ({ value: u.id, label: u.name })),
            },
          ]}
        />
      </Suspense>

      {report === "high-risk" && (
        <Panel title="High-Risk AI Systems">
          <DataTable
            rows={highRisk}
            rowKey={(r) => r.id}
            onRowHref={(r) => `/inventory/${r.id}`}
            columns={[
              { key: "id", header: "ID", cell: (r) => r.systemId },
              { key: "name", header: "System", cell: (r) => r.name },
              { key: "risk", header: "Risk", cell: (r) => <RiskBadge level={r.riskLevel} /> },
              { key: "bu", header: "Business Unit", cell: (r) => r.businessUnit.name },
              { key: "owner", header: "Owner", cell: (r) => r.businessOwner.name },
              { key: "score", header: "Gov Score", cell: (r) => r.governanceScore },
            ]}
          />
        </Panel>
      )}

      {report === "missing-assessments" && (
        <Panel title="AI Systems Missing Assessments">
          <DataTable
            rows={missingAssessments}
            rowKey={(r) => r.id}
            onRowHref={(r) => `/inventory/${r.id}`}
            columns={[
              { key: "id", header: "ID", cell: (r) => r.systemId },
              { key: "name", header: "System", cell: (r) => r.name },
              { key: "bu", header: "Business Unit", cell: (r) => r.businessUnit.name },
              {
                key: "status",
                header: "Assessment Status",
                cell: (r) => <StatusBadge status={r.assessments[0]?.status ?? "NOT_STARTED"} />,
              },
              { key: "last", header: "Last Assessment", cell: (r) => formatDate(r.lastAssessmentAt) },
            ]}
          />
        </Panel>
      )}

      {report === "critical-issues" && (
        <Panel title="Open Critical Issues">
          <DataTable
            rows={criticalIssues}
            rowKey={(r) => r.id}
            columns={[
              { key: "id", header: "Issue ID", cell: (r) => r.issueId },
              { key: "system", header: "AI System", cell: (r) => r.aiSystem.name },
              { key: "title", header: "Title", cell: (r) => r.title },
              { key: "owner", header: "Owner", cell: (r) => r.owner?.name ?? "—" },
              { key: "due", header: "Due", cell: (r) => formatDate(r.dueDate) },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
            ]}
          />
        </Panel>
      )}

      {report === "failed-controls" && (
        <Panel title="Failed Controls">
          <DataTable
            rows={failedControls}
            rowKey={(r) => r.id}
            columns={[
              { key: "control", header: "Control", cell: (r) => r.control.controlId },
              { key: "name", header: "Name", cell: (r) => r.control.name },
              { key: "system", header: "AI System", cell: (r) => r.aiSystem.name },
              { key: "bu", header: "Business Unit", cell: (r) => r.aiSystem.businessUnit.name },
              { key: "status", header: "Status", cell: (r) => <StatusBadge status={r.effectiveness} /> },
            ]}
          />
        </Panel>
      )}

      {report === "upcoming-reviews" && (
        <Panel title="Upcoming Governance Reviews">
          <DataTable
            rows={upcomingReviews}
            rowKey={(r) => r.id}
            onRowHref={(r) => `/inventory/${r.id}`}
            columns={[
              { key: "id", header: "ID", cell: (r) => r.systemId },
              { key: "name", header: "System", cell: (r) => r.name },
              { key: "bu", header: "Business Unit", cell: (r) => r.businessUnit.name },
              { key: "risk", header: "Risk", cell: (r) => <RiskBadge level={r.riskLevel} /> },
              { key: "next", header: "Next Review", cell: (r) => formatDate(r.nextReviewAt) },
            ]}
          />
        </Panel>
      )}

      {report === "missing-approvals" && (
        <Panel title="AI Systems Missing Required Approvals">
          <DataTable
            rows={missingApprovals}
            rowKey={(r) => r.id}
            onRowHref={(r) => `/inventory/${r.id}`}
            columns={[
              { key: "id", header: "ID", cell: (r) => r.systemId },
              { key: "name", header: "System", cell: (r) => r.name },
              { key: "bu", header: "Business Unit", cell: (r) => r.businessUnit.name },
              { key: "pending", header: "Pending Stages", cell: (r) => r.approvals.length },
              { key: "gov", header: "Governance Status", cell: (r) => <StatusBadge status={r.governanceStatus} /> },
            ]}
          />
        </Panel>
      )}

      {report === "score-by-unit" && (
        <Panel title="Governance Score by Business Unit" description="Average governance score (0–100)">
          <BusinessUnitBarChart data={governanceScoreByUnit.sort((a, b) => b.value - a.value)} />
        </Panel>
      )}

      {report === "risk-by-unit" && (
        <Panel title="AI Risk by Business Unit" description="Count of High/Critical systems">
          <BusinessUnitBarChart data={riskByUnit.sort((a, b) => b.value - a.value)} />
          <p className="mt-3 text-xs text-slate-500">
            Filter by business unit above to narrow inventory-linked reports. Current unit filter:{" "}
            {unit ? units.find((u) => u.id === unit)?.name : "All"}.
          </p>
        </Panel>
      )}

      <p className="mt-4 text-xs text-slate-500">
        Report catalog: {titleCase(report.replaceAll("-", "_"))}
      </p>
    </div>
  );
}
