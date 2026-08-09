import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { FilterBar } from "@/components/ui/FilterBar";
import { DataTable } from "@/components/ui/DataTable";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, titleCase, yesNo } from "@/lib/utils";
import { getCurrentSession } from "@/lib/auth";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function InventoryPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const risk = typeof params.risk === "string" ? params.risk : "";
  const unit = typeof params.unit === "string" ? params.unit : "";
  const type = typeof params.type === "string" ? params.type : "";
  const governance = typeof params.governance === "string" ? params.governance : "";
  const production = typeof params.production === "string" ? params.production : "";
  const customerFacing = typeof params.customerFacing === "string" ? params.customerFacing : "";

  const session = await getCurrentSession();
  const [systems, units, types] = await Promise.all([
    prisma.aISystem.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { name: { contains: q, mode: "insensitive" } },
                  { systemId: { contains: q, mode: "insensitive" } },
                  { description: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          risk ? { riskLevel: risk as never } : {},
          unit ? { businessUnitId: unit } : {},
          type ? { aiTypeId: type } : {},
          governance ? { governanceStatus: governance as never } : {},
          production ? { productionStatus: production as never } : {},
          customerFacing === "true"
            ? { customerFacing: true }
            : customerFacing === "false"
              ? { customerFacing: false }
              : {},
        ],
      },
      include: {
        aiType: true,
        businessUnit: true,
        businessOwner: true,
        technicalOwner: true,
      },
      orderBy: { systemId: "asc" },
    }),
    prisma.businessUnit.findMany({ orderBy: { name: "asc" } }),
    prisma.aIType.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="AI Inventory"
        description="Enterprise inventory of AI/ML systems with ownership, risk classification, and governance status."
        actions={
          session.permissions.canEdit ? (
            <Link
              href="/inventory/new"
              className="rounded-md bg-teal-800 px-3 py-1.5 text-sm font-medium text-white hover:bg-teal-900"
            >
              Add AI System
            </Link>
          ) : null
        }
      />

      <Suspense fallback={<div className="mb-4 h-24 animate-pulse rounded-lg bg-slate-200" />}>
        <FilterBar
          searchPlaceholder="Search by ID, name, or description..."
          filters={[
            {
              key: "risk",
              label: "Risk Level",
              options: ["CRITICAL", "HIGH", "MEDIUM", "LOW"].map((v) => ({ value: v, label: titleCase(v) })),
            },
            {
              key: "unit",
              label: "Business Unit",
              options: units.map((u) => ({ value: u.id, label: u.name })),
            },
            {
              key: "type",
              label: "AI Type",
              options: types.map((t) => ({ value: t.id, label: t.name })),
            },
            {
              key: "governance",
              label: "Governance Status",
              options: [
                "DRAFT",
                "PENDING_REVIEW",
                "IN_ASSESSMENT",
                "APPROVED",
                "CONDITIONAL",
                "REJECTED",
                "UNDER_MONITORING",
              ].map((v) => ({ value: v, label: titleCase(v) })),
            },
            {
              key: "production",
              label: "Production Status",
              options: ["CONCEPT", "DEVELOPMENT", "PILOT", "PRODUCTION", "RETIRED"].map((v) => ({
                value: v,
                label: titleCase(v),
              })),
            },
            {
              key: "customerFacing",
              label: "Customer Facing",
              options: [
                { value: "true", label: "Yes" },
                { value: "false", label: "No" },
              ],
            },
          ]}
        />
      </Suspense>

      <DataTable
        rows={systems}
        rowKey={(row) => row.id}
        onRowHref={(row) => `/inventory/${row.id}`}
        emptyMessage="No AI systems match the selected filters."
        columns={[
          { key: "systemId", header: "AI System ID", cell: (row) => row.systemId },
          { key: "name", header: "System Name", cell: (row) => row.name },
          {
            key: "description",
            header: "Description",
            className: "max-w-xs whitespace-normal",
            cell: (row) => <span className="line-clamp-2 text-slate-600">{row.description}</span>,
          },
          { key: "aiType", header: "AI Type", cell: (row) => row.aiType.name },
          { key: "bu", header: "Business Unit", cell: (row) => row.businessUnit.name },
          { key: "bizOwner", header: "Business Owner", cell: (row) => row.businessOwner.name },
          { key: "techOwner", header: "Technical Owner", cell: (row) => row.technicalOwner.name },
          { key: "risk", header: "Risk Level", cell: (row) => <RiskBadge level={row.riskLevel} /> },
          { key: "cf", header: "Customer Facing", cell: (row) => yesNo(row.customerFacing) },
          { key: "sens", header: "Data Sensitivity", cell: (row) => titleCase(row.dataSensitivity) },
          {
            key: "prod",
            header: "Production Status",
            cell: (row) => <StatusBadge status={row.productionStatus} />,
          },
          {
            key: "gov",
            header: "Governance Status",
            cell: (row) => <StatusBadge status={row.governanceStatus} />,
          },
          { key: "last", header: "Last Assessment", cell: (row) => formatDate(row.lastAssessmentAt) },
          { key: "next", header: "Next Review", cell: (row) => formatDate(row.nextReviewAt) },
        ]}
      />
      <p className="mt-3 text-xs text-slate-500">{systems.length} systems shown</p>
    </div>
  );
}
