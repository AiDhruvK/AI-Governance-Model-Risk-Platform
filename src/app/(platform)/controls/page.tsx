import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Suspense } from "react";
import { FilterBar } from "@/components/ui/FilterBar";
import { titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ControlsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const effectiveness = typeof params.effectiveness === "string" ? params.effectiveness : "";

  const [controls, assessments] = await Promise.all([
    prisma.control.findMany({
      include: { owner: true, _count: { select: { assessments: true } } },
      orderBy: { controlId: "asc" },
    }),
    prisma.aIControlAssessment.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { control: { controlId: { contains: q, mode: "insensitive" } } },
                  { control: { name: { contains: q, mode: "insensitive" } } },
                  { aiSystem: { name: { contains: q, mode: "insensitive" } } },
                ],
              }
            : {},
          effectiveness ? { effectiveness: effectiveness as never } : {},
        ],
      },
      include: {
        control: true,
        aiSystem: true,
        tester: true,
      },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Governance Controls"
        description="Enterprise AI control library and per-system control assessment results."
      />

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {controls.map((control) => (
          <Panel
            key={control.id}
            title={`${control.controlId} · ${control.name}`}
            actions={<StatusBadge status={control.status} />}
          >
            <p className="text-sm text-slate-700">{control.requirement}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-600">
              <div>
                <dt className="text-slate-400">Control Owner</dt>
                <dd className="font-medium text-slate-800">{control.owner?.name ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Applicable Risk Level</dt>
                <dd>
                  <RiskBadge level={control.applicableRiskLevel} />
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Testing Frequency</dt>
                <dd className="font-medium text-slate-800">{control.testingFrequency}</dd>
              </div>
              <div>
                <dt className="text-slate-400">System Assessments</dt>
                <dd className="font-medium text-slate-800">{control._count.assessments}</dd>
              </div>
            </dl>
          </Panel>
        ))}
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-900">Control Assessments</h2>
      <Suspense fallback={null}>
        <FilterBar
          searchPlaceholder="Search controls or systems..."
          filters={[
            {
              key: "effectiveness",
              label: "Effectiveness",
              options: [
                "EFFECTIVE",
                "PARTIALLY_EFFECTIVE",
                "INEFFECTIVE",
                "NOT_APPLICABLE",
                "NOT_TESTED",
              ].map((v) => ({ value: v, label: titleCase(v) })),
            },
          ]}
        />
      </Suspense>
      <DataTable
        rows={assessments}
        rowKey={(row) => row.id}
        onRowHref={(row) => `/inventory/${row.aiSystemId}`}
        columns={[
          { key: "control", header: "Control ID", cell: (row) => row.control.controlId },
          { key: "name", header: "Control Name", cell: (row) => row.control.name },
          { key: "system", header: "AI System", cell: (row) => row.aiSystem.name },
          {
            key: "eff",
            header: "Status",
            cell: (row) => <StatusBadge status={row.effectiveness} />,
          },
          { key: "tester", header: "Tester", cell: (row) => row.tester?.name ?? "—" },
          {
            key: "evidence",
            header: "Evidence",
            className: "max-w-xs whitespace-normal",
            cell: (row) => row.evidence ?? "—",
          },
          {
            key: "remediation",
            header: "Remediation",
            className: "max-w-xs whitespace-normal",
            cell: (row) => row.remediationAction ?? "—",
          },
        ]}
      />
      <p className="mt-3 text-xs text-slate-500">
        Control library administration is available under{" "}
        <Link href="/admin/control-library" className="text-teal-800 underline">
          Administration
        </Link>
        .
      </p>
    </div>
  );
}
