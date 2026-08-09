import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { getCurrentSession } from "@/lib/auth";

const adminLinks = [
  { href: "/admin/business-units", title: "Business Units", description: "Organizational units owning AI systems" },
  { href: "/admin/users", title: "Users", description: "Platform users and ownership assignments" },
  { href: "/admin/roles", title: "Roles", description: "Role definitions and simulated permissions" },
  { href: "/admin/ai-types", title: "AI Types", description: "Taxonomy of AI/ML system types" },
  { href: "/admin/risk-categories", title: "Risk Categories", description: "Risk dimension catalog and weights" },
  { href: "/admin/control-library", title: "Control Library", description: "Enterprise AI governance controls" },
  { href: "/admin/assessment-questions", title: "Assessment Questions", description: "Risk assessment questionnaire bank" },
];

export default async function AdminPage() {
  const session = await getCurrentSession();

  return (
    <div>
      <PageHeader
        title="Administration"
        description="Reference data and configuration for the AI governance platform."
      />
      {!session.permissions.canAdmin && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          You are viewing administration in read-only mode as {session.role.replaceAll("_", " ")}.
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminLinks.map((link) => (
          <Link key={link.href} href={link.href} className="block transition hover:-translate-y-0.5">
            <Panel title={link.title}>
              <p className="text-sm text-slate-600">{link.description}</p>
            </Panel>
          </Link>
        ))}
      </div>
    </div>
  );
}
