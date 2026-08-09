import { cn, titleCase } from "@/lib/utils";

const styles: Record<string, string> = {
  OPEN: "bg-red-50 text-red-700 ring-red-200",
  IN_PROGRESS: "bg-sky-50 text-sky-700 ring-sky-200",
  PENDING_VALIDATION: "bg-amber-50 text-amber-700 ring-amber-200",
  CLOSED: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING: "bg-amber-50 text-amber-700 ring-amber-200",
  APPROVED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  REJECTED: "bg-red-50 text-red-700 ring-red-200",
  CHANGES_REQUESTED: "bg-orange-50 text-orange-700 ring-orange-200",
  PASSED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PASSED_WITH_CONDITIONS: "bg-amber-50 text-amber-700 ring-amber-200",
  FAILED: "bg-red-50 text-red-700 ring-red-200",
  EFFECTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PARTIALLY_EFFECTIVE: "bg-amber-50 text-amber-700 ring-amber-200",
  INEFFECTIVE: "bg-red-50 text-red-700 ring-red-200",
  NOT_APPLICABLE: "bg-slate-100 text-slate-600 ring-slate-200",
  NOT_TESTED: "bg-orange-50 text-orange-700 ring-orange-200",
  PRODUCTION: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  PILOT: "bg-sky-50 text-sky-700 ring-sky-200",
  DEVELOPMENT: "bg-slate-100 text-slate-700 ring-slate-200",
  CONCEPT: "bg-slate-100 text-slate-600 ring-slate-200",
  RETIRED: "bg-slate-200 text-slate-600 ring-slate-300",
  DRAFT: "bg-slate-100 text-slate-600 ring-slate-200",
  PENDING_REVIEW: "bg-amber-50 text-amber-700 ring-amber-200",
  IN_ASSESSMENT: "bg-sky-50 text-sky-700 ring-sky-200",
  CONDITIONAL: "bg-orange-50 text-orange-700 ring-orange-200",
  UNDER_MONITORING: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  OVERDUE: "bg-red-50 text-red-700 ring-red-200",
  NOT_STARTED: "bg-slate-100 text-slate-600 ring-slate-200",
  ACTIVE: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  INACTIVE: "bg-slate-100 text-slate-600 ring-slate-200",
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        styles[status] ?? "bg-slate-50 text-slate-700 ring-slate-200",
        className
      )}
    >
      {titleCase(status)}
    </span>
  );
}
