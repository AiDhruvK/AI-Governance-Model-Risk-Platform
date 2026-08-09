import { Panel } from "./Panel";

export function GovernanceScorePanel({
  score,
  breakdown,
}: {
  score: number;
  breakdown: Array<{ label: string; value: number; weight?: string }>;
}) {
  const tone = score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-700" : "text-red-700";

  return (
    <Panel title="AI Governance Score" description="Composite score based on documentation, controls, testing, approvals, and issues.">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-full border-4 border-slate-200">
          <span className={`text-3xl font-semibold tabular-nums ${tone}`}>{score}</span>
          <span className="text-xs text-slate-500">/ 100</span>
        </div>
        <div className="grid flex-1 gap-2">
          {breakdown.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                <span>
                  {item.label}
                  {item.weight ? <span className="text-slate-400"> · {item.weight}</span> : null}
                </span>
                <span className="font-medium tabular-nums text-slate-800">{item.value}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded bg-slate-100">
                <div
                  className={`h-full rounded ${item.value >= 80 ? "bg-emerald-600" : item.value >= 60 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${Math.min(100, item.value)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
