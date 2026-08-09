import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/constants";
import type { UserRole } from "@prisma/client";

const descriptions: Record<UserRole, string> = {
  EXECUTIVE: "Primarily views dashboards and reports for enterprise oversight.",
  AI_GOVERNANCE_MANAGER: "Manages assessments, controls, approvals, and issues across the portfolio.",
  BUSINESS_OWNER: "Maintains business information for AI systems they own.",
  TECHNICAL_OWNER: "Updates technical information and testing evidence.",
  RISK_COMPLIANCE: "Reviews assessments, privacy/security posture, and governance controls.",
  AUDITOR: "Read-only access to governance records and audit history.",
};

export default function RolesAdminPage() {
  const roles = Object.keys(ROLE_LABELS) as UserRole[];

  return (
    <div>
      <PageHeader
        title="Roles"
        description="Simulated role-based access for demonstration. Use the header role switcher to change perspective."
      />
      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role) => {
          const perms = ROLE_PERMISSIONS[role];
          return (
            <Panel key={role} title={ROLE_LABELS[role]}>
              <p className="text-sm text-slate-700">{descriptions[role]}</p>
              <ul className="mt-3 space-y-1 text-xs text-slate-600">
                <li>Edit records: {perms.canEdit ? "Yes" : "No"}</li>
                <li>Approve workflows: {perms.canApprove ? "Yes" : "No"}</li>
                <li>Administer config: {perms.canAdmin ? "Yes" : "No"}</li>
                <li>Read-only mode: {perms.readOnly ? "Yes" : "No"}</li>
              </ul>
            </Panel>
          );
        })}
      </div>
    </div>
  );
}
