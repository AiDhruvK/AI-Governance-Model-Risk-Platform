import { APPROVAL_STAGE_LABELS } from "@/lib/constants";
import { formatDate, titleCase } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Check, Clock, X, RotateCcw } from "lucide-react";

type ApprovalItem = {
  id: string;
  stage: string;
  status: string;
  reviewDate?: Date | string | null;
  comments?: string | null;
  reviewer?: { name: string } | null;
  sortOrder: number;
};

const iconFor = (status: string) => {
  if (status === "APPROVED") return <Check className="h-4 w-4 text-emerald-700" />;
  if (status === "REJECTED") return <X className="h-4 w-4 text-red-700" />;
  if (status === "CHANGES_REQUESTED") return <RotateCcw className="h-4 w-4 text-orange-700" />;
  return <Clock className="h-4 w-4 text-amber-700" />;
};

export function ApprovalWorkflow({ approvals }: { approvals: ApprovalItem[] }) {
  const ordered = [...approvals].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <ol className="space-y-3">
      {ordered.map((item, index) => (
        <li key={item.id} className="relative flex gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white ring-1 ring-slate-200">
            {iconFor(item.status)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Stage {index + 1}</span>
              <StatusBadge status={item.status} />
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {APPROVAL_STAGE_LABELS[item.stage] ?? titleCase(item.stage)}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Reviewer: {item.reviewer?.name ?? "Unassigned"} · Date: {formatDate(item.reviewDate)}
            </p>
            {item.comments ? <p className="mt-1 text-xs text-slate-500">{item.comments}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
