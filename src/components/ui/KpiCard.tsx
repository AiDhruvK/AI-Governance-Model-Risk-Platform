import { cn } from "@/lib/utils";
import type { KpiItem } from "@/lib/types";

const toneStyles = {
  default: "border-slate-200",
  danger: "border-red-200",
  warning: "border-amber-200",
  success: "border-emerald-200",
  info: "border-sky-200",
};

const valueStyles = {
  default: "text-slate-900",
  danger: "text-red-700",
  warning: "text-amber-700",
  success: "text-emerald-700",
  info: "text-sky-700",
};

export function KpiCard({ label, value, hint, tone = "default" }: KpiItem) {
  return (
    <div className={cn("rounded-lg border bg-white p-4 shadow-sm", toneStyles[tone])}>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={cn("mt-2 text-2xl font-semibold tabular-nums", valueStyles[tone])}>{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  );
}
