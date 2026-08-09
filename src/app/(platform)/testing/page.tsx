import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { DataTable } from "@/components/ui/DataTable";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { KpiCard } from "@/components/ui/KpiCard";
import { FilterBar } from "@/components/ui/FilterBar";
import { formatDate } from "@/lib/utils";
import { TEST_CATEGORIES } from "@/lib/constants";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function TestingPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const type = typeof params.type === "string" ? params.type : "";
  const result = typeof params.result === "string" ? params.result : "";

  const [tests, passed, conditional, failed] = await Promise.all([
    prisma.test.findMany({
      where: {
        AND: [
          q
            ? {
                OR: [
                  { testId: { contains: q, mode: "insensitive" } },
                  { aiSystem: { name: { contains: q, mode: "insensitive" } } },
                  { testType: { contains: q, mode: "insensitive" } },
                ],
              }
            : {},
          type ? { testType: type } : {},
          result ? { result: result as never } : {},
        ],
      },
      include: { aiSystem: true, tester: true },
      orderBy: { testDate: "desc" },
    }),
    prisma.test.count({ where: { result: "PASSED" } }),
    prisma.test.count({ where: { result: "PASSED_WITH_CONDITIONS" } }),
    prisma.test.count({ where: { result: "FAILED" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Testing & Validation"
        description="Model performance, fairness, security, privacy, and GenAI safety testing evidence."
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <KpiCard label="Passed" value={passed} tone="success" />
        <KpiCard label="Passed with Conditions" value={conditional} tone="warning" />
        <KpiCard label="Failed" value={failed} tone="danger" />
      </div>

      <Suspense fallback={null}>
        <FilterBar
          searchPlaceholder="Search tests or systems..."
          filters={[
            {
              key: "type",
              label: "Test Type",
              options: TEST_CATEGORIES.map((v) => ({ value: v, label: v })),
            },
            {
              key: "result",
              label: "Result",
              options: [
                { value: "PASSED", label: "Passed" },
                { value: "PASSED_WITH_CONDITIONS", label: "Passed with Conditions" },
                { value: "FAILED", label: "Failed" },
              ],
            },
          ]}
        />
      </Suspense>

      <DataTable
        rows={tests}
        rowKey={(row) => row.id}
        onRowHref={(row) => `/inventory/${row.aiSystemId}`}
        columns={[
          { key: "id", header: "Test ID", cell: (row) => row.testId },
          { key: "system", header: "AI System", cell: (row) => row.aiSystem.name },
          { key: "type", header: "Test Type", cell: (row) => row.testType },
          { key: "tester", header: "Tester", cell: (row) => row.tester?.name ?? "—" },
          { key: "date", header: "Test Date", cell: (row) => formatDate(row.testDate) },
          { key: "result", header: "Result", cell: (row) => <StatusBadge status={row.result} /> },
          { key: "score", header: "Score", cell: (row) => row.score ?? "—" },
          {
            key: "evidence",
            header: "Evidence",
            className: "max-w-xs whitespace-normal",
            cell: (row) => row.evidence ?? "—",
          },
          {
            key: "comments",
            header: "Comments",
            className: "max-w-xs whitespace-normal",
            cell: (row) => row.comments ?? "—",
          },
        ]}
      />
    </div>
  );
}
