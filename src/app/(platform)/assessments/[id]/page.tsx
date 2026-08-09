import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatDate, titleCase } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AssessmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const assessment = await prisma.riskAssessment.findUnique({
    where: { id },
    include: {
      aiSystem: true,
      lead: true,
      responses: { include: { question: true }, orderBy: { question: { sortOrder: "asc" } } },
    },
  });
  if (!assessment) notFound();

  const sections = Array.from(new Set(assessment.responses.map((r) => r.question.section)));

  return (
    <div>
      <PageHeader
        title={`Assessment · ${assessment.aiSystem.name}`}
        description={assessment.summary ?? "AI risk assessment detail"}
        actions={
          <Link href="/assessments" className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm">
            Back
          </Link>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Panel>
          <p className="text-xs text-slate-500">Overall Score</p>
          <p className="mt-1 text-3xl font-semibold">{assessment.overallScore}/100</p>
        </Panel>
        <Panel>
          <p className="text-xs text-slate-500">Risk Level</p>
          <div className="mt-2">
            <RiskBadge level={assessment.riskLevel} />
          </div>
        </Panel>
        <Panel>
          <p className="text-xs text-slate-500">Status</p>
          <div className="mt-2">
            <StatusBadge status={assessment.status} />
          </div>
        </Panel>
        <Panel>
          <p className="text-xs text-slate-500">Lead / Completed</p>
          <p className="mt-1 text-sm font-medium">{assessment.lead?.name ?? "—"}</p>
          <p className="text-xs text-slate-500">{formatDate(assessment.completedAt)}</p>
        </Panel>
      </div>

      {assessment.factorNotes ? (
        <Panel title="Score Explanation" className="mb-4">
          <p className="text-sm text-slate-700">{assessment.factorNotes}</p>
        </Panel>
      ) : null}

      <div className="space-y-4">
        {sections.map((section) => (
          <Panel key={section} title={section}>
            <div className="space-y-2">
              {assessment.responses
                .filter((r) => r.question.section === section)
                .map((r) => (
                  <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-100 px-3 py-2 text-sm">
                    <span className="text-slate-800">{r.question.question}</span>
                    <span className={`font-semibold ${r.answer ? "text-orange-700" : "text-emerald-700"}`}>
                      {r.answer ? "Yes" : "No"}
                    </span>
                  </div>
                ))}
            </div>
          </Panel>
        ))}
      </div>

      <p className="mt-4 text-xs text-slate-500">
        Classification bands: 0–29 Low · 30–59 Medium · 60–79 High · 80–100 Critical. Current classification:{" "}
        {titleCase(assessment.riskLevel)}.
      </p>
    </div>
  );
}
