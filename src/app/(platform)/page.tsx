import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { KpiCard } from "@/components/ui/KpiCard";
import { Panel } from "@/components/ui/Panel";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import {
  BusinessUnitBarChart,
  ComplianceTrendChart,
  RiskBarChart,
  TypePieChart,
} from "@/components/charts/SimpleCharts";
import { titleCase } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ExecutiveDashboardPage() {
  const [
    total,
    high,
    medium,
    low,
    critical,
    pendingReview,
    openIssues,
    overdueAssessments,
    failedControls,
    byUnit,
    byType,
    trends,
    topRisks,
  ] = await Promise.all([
    prisma.aISystem.count(),
    prisma.aISystem.count({ where: { riskLevel: "HIGH" } }),
    prisma.aISystem.count({ where: { riskLevel: "MEDIUM" } }),
    prisma.aISystem.count({ where: { riskLevel: "LOW" } }),
    prisma.aISystem.count({ where: { riskLevel: "CRITICAL" } }),
    prisma.aISystem.count({
      where: { governanceStatus: { in: ["PENDING_REVIEW", "IN_ASSESSMENT"] } },
    }),
    prisma.issue.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING_VALIDATION"] } } }),
    prisma.riskAssessment.count({ where: { status: "OVERDUE" } }),
    prisma.aIControlAssessment.count({ where: { effectiveness: "INEFFECTIVE" } }),
    prisma.aISystem.groupBy({
      by: ["businessUnitId"],
      _count: { _all: true },
    }),
    prisma.aISystem.groupBy({
      by: ["aiTypeId"],
      _count: { _all: true },
    }),
    prisma.complianceTrend.findMany({ orderBy: { month: "asc" } }),
    prisma.aISystem.findMany({
      where: { riskLevel: { in: ["CRITICAL", "HIGH"] } },
      include: {
        businessUnit: true,
        businessOwner: true,
        assessments: { orderBy: { updatedAt: "desc" }, take: 1 },
        issues: { where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING_VALIDATION"] } } },
      },
      orderBy: [{ riskLevel: "asc" }, { governanceScore: "asc" }],
      take: 8,
    }),
  ]);

  const units = await prisma.businessUnit.findMany();
  const types = await prisma.aIType.findMany();
  const unitMap = Object.fromEntries(units.map((u) => [u.id, u.name]));
  const typeMap = Object.fromEntries(types.map((t) => [t.id, t.name]));

  const riskChart = [
    { name: "Critical", value: critical },
    { name: "High", value: high },
    { name: "Medium", value: medium },
    { name: "Low", value: low },
  ];

  const unitChart = byUnit
    .map((row) => ({ name: unitMap[row.businessUnitId] ?? "Unknown", value: row._count._all }))
    .sort((a, b) => b.value - a.value);

  const typeChart = byType.map((row) => ({
    name: typeMap[row.aiTypeId] ?? "Unknown",
    value: row._count._all,
  }));

  return (
    <div>
      <PageHeader
        title="Executive Dashboard"
        description="Enterprise view of AI inventory risk, governance compliance, open issues, and control health."
        actions={
          <Link
            href="/reports"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            View Reports
          </Link>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total AI Systems" value={total} tone="info" />
        <KpiCard label="High-Risk AI Systems" value={high + critical} hint={`${critical} critical`} tone="danger" />
        <KpiCard label="Medium-Risk AI Systems" value={medium} tone="warning" />
        <KpiCard label="Low-Risk AI Systems" value={low} tone="success" />
        <KpiCard label="Systems Pending Review" value={pendingReview} tone="warning" />
        <KpiCard label="Open Governance Issues" value={openIssues} tone="danger" />
        <KpiCard label="Overdue Assessments" value={overdueAssessments} tone="danger" />
        <KpiCard label="Failed Controls" value={failedControls} tone="danger" />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <Panel title="AI Systems by Risk Level">
          <RiskBarChart data={riskChart} />
        </Panel>
        <Panel title="AI Systems by Business Unit">
          <BusinessUnitBarChart data={unitChart} />
        </Panel>
        <Panel title="AI Systems by Type">
          <TypePieChart data={typeChart} />
        </Panel>
        <Panel title="Governance Compliance Trend" description="Monthly enterprise governance compliance percentage">
          <ComplianceTrendChart
            data={trends.map((t) => ({
              month: t.month.replace("2025-", "25-").replace("2026-", "26-"),
              percentage: t.percentage,
            }))}
          />
        </Panel>
      </div>

      <div className="mt-6">
        <Panel title="Top Governance Risks" description="Highest-risk systems requiring executive attention">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-3">AI System</th>
                  <th className="py-2 pr-3">Risk Level</th>
                  <th className="py-2 pr-3">Business Unit</th>
                  <th className="py-2 pr-3">Owner</th>
                  <th className="py-2 pr-3">Open Issues</th>
                  <th className="py-2">Assessment Status</th>
                </tr>
              </thead>
              <tbody>
                {topRisks.map((system) => (
                  <tr key={system.id} className="border-b border-slate-50">
                    <td className="py-2.5 pr-3">
                      <Link href={`/inventory/${system.id}`} className="font-medium text-slate-900 hover:text-teal-800 hover:underline">
                        {system.name}
                      </Link>
                      <div className="text-xs text-slate-500">{system.systemId}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      <RiskBadge level={system.riskLevel} />
                    </td>
                    <td className="py-2.5 pr-3 text-slate-700">{system.businessUnit.name}</td>
                    <td className="py-2.5 pr-3 text-slate-700">{system.businessOwner.name}</td>
                    <td className="py-2.5 pr-3 tabular-nums text-slate-700">{system.issues.length}</td>
                    <td className="py-2.5">
                      <StatusBadge status={system.assessments[0]?.status ?? "NOT_STARTED"} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Risk taxonomy shown as {["CRITICAL", "HIGH", "MEDIUM", "LOW"].map(titleCase).join(" · ")}. Data refreshed from
        governance inventory.
      </p>
    </div>
  );
}
