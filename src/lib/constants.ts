import type { UserRole } from "@prisma/client";

export const APP_NAME = "AI Governance & Model Risk Platform";
export const APP_SHORT = "AI Gov Platform";

export const NAV_ITEMS = [
  { href: "/", label: "Executive Dashboard", icon: "LayoutDashboard" },
  { href: "/inventory", label: "AI Inventory", icon: "Boxes" },
  { href: "/assessments", label: "Risk Assessments", icon: "ClipboardCheck" },
  { href: "/controls", label: "Controls", icon: "ShieldCheck" },
  { href: "/testing", label: "Testing & Validation", icon: "FlaskConical" },
  { href: "/issues", label: "Issues", icon: "AlertTriangle" },
  { href: "/approvals", label: "Approvals", icon: "GitPullRequest" },
  { href: "/reports", label: "Reports", icon: "FileBarChart" },
  { href: "/admin", label: "Administration", icon: "Settings" },
] as const;

export const ROLE_LABELS: Record<UserRole, string> = {
  EXECUTIVE: "Executive",
  AI_GOVERNANCE_MANAGER: "AI Governance Manager",
  BUSINESS_OWNER: "Business Owner",
  TECHNICAL_OWNER: "Data Scientist / Technical Owner",
  RISK_COMPLIANCE: "Risk / Compliance Reviewer",
  AUDITOR: "Auditor",
};

export const ROLE_PERMISSIONS: Record<
  UserRole,
  { canEdit: boolean; canApprove: boolean; canAdmin: boolean; readOnly: boolean }
> = {
  EXECUTIVE: { canEdit: false, canApprove: false, canAdmin: false, readOnly: true },
  AI_GOVERNANCE_MANAGER: { canEdit: true, canApprove: true, canAdmin: true, readOnly: false },
  BUSINESS_OWNER: { canEdit: true, canApprove: true, canAdmin: false, readOnly: false },
  TECHNICAL_OWNER: { canEdit: true, canApprove: false, canAdmin: false, readOnly: false },
  RISK_COMPLIANCE: { canEdit: true, canApprove: true, canAdmin: false, readOnly: false },
  AUDITOR: { canEdit: false, canApprove: false, canAdmin: false, readOnly: true },
};

export const RISK_ORDER = ["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const;

export const APPROVAL_STAGE_LABELS: Record<string, string> = {
  BUSINESS_OWNER_REVIEW: "Business Owner Review",
  TECHNICAL_REVIEW: "Technical Review",
  AI_RISK_REVIEW: "AI Risk Review",
  PRIVACY_REVIEW: "Privacy Review",
  SECURITY_REVIEW: "Security Review",
  LEGAL_COMPLIANCE_REVIEW: "Legal / Compliance Review",
  FINAL_GOVERNANCE_APPROVAL: "Final Governance Approval",
};

export const TEST_CATEGORIES = [
  "Model Performance",
  "Bias / Fairness",
  "Explainability",
  "Hallucination Testing",
  "Prompt Injection",
  "Security",
  "Privacy",
  "Data Quality",
  "Model Drift",
  "Stress Testing",
] as const;
