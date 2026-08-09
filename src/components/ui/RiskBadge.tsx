import { cn, titleCase } from "@/lib/utils";

const styles: Record<string, string> = {
  CRITICAL: "bg-red-50 text-red-800 ring-red-200",
  HIGH: "bg-orange-50 text-orange-800 ring-orange-200",
  MEDIUM: "bg-amber-50 text-amber-800 ring-amber-200",
  LOW: "bg-emerald-50 text-emerald-800 ring-emerald-200",
};

export function RiskBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ring-1 ring-inset",
        styles[level] ?? "bg-slate-50 text-slate-700 ring-slate-200",
        className
      )}
    >
      {titleCase(level)}
    </span>
  );
}
