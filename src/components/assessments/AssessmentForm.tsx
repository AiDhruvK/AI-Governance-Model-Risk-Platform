"use client";

import { useMemo, useState } from "react";
import { calculateRiskScore } from "@/lib/scoring";
import { RiskBadge } from "@/components/ui/RiskBadge";
import { Panel } from "@/components/ui/Panel";

type Question = {
  id: string;
  section: string;
  question: string;
  weight: number;
  helpText?: string | null;
};

export function AssessmentForm({
  questions,
  systems,
  action,
}: {
  questions: Question[];
  systems: Array<{ id: string; name: string; systemId: string }>;
  action: (formData: FormData) => Promise<void>;
}) {
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const sections = Array.from(new Set(questions.map((q) => q.section)));

  const result = useMemo(() => {
    const payload = questions.map((q) => ({
      weight: q.weight,
      answer: Boolean(answers[q.id]),
      section: q.section,
      question: q.question,
    }));
    return calculateRiskScore(payload);
  }, [answers, questions]);

  return (
    <form action={action} className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <Panel title="Assessment Target">
          <label className="block text-xs font-medium text-slate-500">
            AI System
            <select
              name="aiSystemId"
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option value="">Select system...</option>
              {systems.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.systemId} — {s.name}
                </option>
              ))}
            </select>
          </label>
        </Panel>

        {sections.map((section) => (
          <Panel key={section} title={section}>
            <div className="space-y-3">
              {questions
                .filter((q) => q.section === section)
                .map((q) => (
                  <div key={q.id} className="rounded-md border border-slate-200 p-3">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">{q.question}</p>
                        <p className="mt-1 text-xs text-slate-500">Weight: {q.weight}</p>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`answer_${q.id}`}
                            value="yes"
                            checked={answers[q.id] === true}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: true }))}
                          />
                          Yes
                        </label>
                        <label className="flex items-center gap-1">
                          <input
                            type="radio"
                            name={`answer_${q.id}`}
                            value="no"
                            checked={answers[q.id] === false}
                            onChange={() => setAnswers((prev) => ({ ...prev, [q.id]: false }))}
                          />
                          No
                        </label>
                      </div>
                    </div>
                    <input type="hidden" name={`q_${q.id}`} value={answers[q.id] ? "yes" : "no"} />
                  </div>
                ))}
            </div>
          </Panel>
        ))}

        <button type="submit" className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900">
          Save Assessment
        </button>
      </div>

      <div className="lg:sticky lg:top-20 lg:self-start">
        <Panel title="Calculated Risk Score" description="Updates as you answer questions">
          <div className="flex items-end gap-3">
            <p className="text-4xl font-semibold tabular-nums text-slate-900">{result.overallScore}</p>
            <p className="mb-1 text-sm text-slate-500">/ 100</p>
            <RiskBadge level={result.riskLevel} />
          </div>
          <p className="mt-3 text-sm text-slate-600">{result.explanation}</p>
          <div className="mt-4 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top contributing factors</p>
            {result.topFactors.length === 0 ? (
              <p className="text-sm text-slate-500">Answer “Yes” on risk factors to see contributors.</p>
            ) : (
              result.topFactors.map((factor) => (
                <div key={factor.question} className="rounded border border-slate-200 px-2 py-1.5 text-xs text-slate-700">
                  <span className="font-medium">{factor.section}:</span> {factor.question}{" "}
                  <span className="text-slate-500">(+{factor.contribution}%)</span>
                </div>
              ))
            )}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {Object.entries(result.sectionScores).map(([section, score]) => (
              <div key={section} className="rounded bg-slate-50 px-2 py-1.5">
                <p className="text-slate-500">{section}</p>
                <p className="font-semibold text-slate-800">{score}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[11px] text-slate-500">
            0–29 Low · 30–59 Medium · 60–79 High · 80–100 Critical
          </p>
        </Panel>
      </div>
    </form>
  );
}
