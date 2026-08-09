import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function createSystem(formData: FormData) {
  "use server";

  const session = await getCurrentSession();
  if (!session.permissions.canEdit) {
    throw new Error("You do not have permission to create AI systems.");
  }

  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();
  if (!name || !description) {
    throw new Error("Name and description are required.");
  }

  const count = await prisma.aISystem.count();
  const systemId = `AI-${String(count + 1).padStart(3, "0")}`;

  const created = await prisma.aISystem.create({
    data: {
      systemId,
      name,
      description,
      businessPurpose: String(formData.get("businessPurpose") || "To be documented"),
      businessImpact: String(formData.get("businessImpact") || "To be assessed"),
      users: String(formData.get("users") || "To be defined"),
      deploymentEnv: String(formData.get("deploymentEnv") || "TBD"),
      modelProvider: String(formData.get("modelProvider") || "TBD"),
      dataSources: String(formData.get("dataSources") || "TBD"),
      downstreamSystems: String(formData.get("downstreamSystems") || "TBD"),
      aiTypeId: String(formData.get("aiTypeId")),
      businessUnitId: String(formData.get("businessUnitId")),
      businessOwnerId: String(formData.get("businessOwnerId")),
      technicalOwnerId: String(formData.get("technicalOwnerId")),
      riskLevel: String(formData.get("riskLevel") || "MEDIUM") as never,
      customerFacing: formData.get("customerFacing") === "on",
      dataSensitivity: String(formData.get("dataSensitivity") || "INTERNAL") as never,
      productionStatus: String(formData.get("productionStatus") || "DEVELOPMENT") as never,
      governanceStatus: "DRAFT",
      nextReviewAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.auditEvent.create({
    data: {
      aiSystemId: created.id,
      actorId: session.user?.id,
      action: "SYSTEM_REGISTERED",
      details: `${created.name} registered via inventory form.`,
    },
  });

  revalidatePath("/inventory");
  revalidatePath("/");
  redirect(`/inventory/${created.id}`);
}

export default async function NewAISystemPage() {
  const session = await getCurrentSession();
  if (!session.permissions.canEdit) {
    redirect("/inventory");
  }

  const [units, types, users] = await Promise.all([
    prisma.businessUnit.findMany({ orderBy: { name: "asc" } }),
    prisma.aIType.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Add AI System"
        description="Register a new AI/ML system in the enterprise inventory."
      />
      <Panel>
        <form action={createSystem} className="grid gap-4 md:grid-cols-2">
          <Field label="System Name" name="name" required />
          <Field label="AI Type">
            <select name="aiTypeId" required className={inputClass}>
              {types.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Description" className="md:col-span-2">
            <textarea name="description" required rows={3} className={inputClass} />
          </Field>
          <Field label="Business Purpose" name="businessPurpose" />
          <Field label="Business Impact" name="businessImpact" />
          <Field label="Users" name="users" />
          <Field label="Deployment Environment" name="deploymentEnv" />
          <Field label="Model / Provider" name="modelProvider" />
          <Field label="Data Sources" name="dataSources" />
          <Field label="Downstream Systems" name="downstreamSystems" />
          <Field label="Business Unit">
            <select name="businessUnitId" required className={inputClass}>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Business Owner">
            <select name="businessOwnerId" required className={inputClass}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Technical Owner">
            <select name="technicalOwnerId" required className={inputClass}>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Risk Level">
            <select name="riskLevel" className={inputClass} defaultValue="MEDIUM">
              {["LOW", "MEDIUM", "HIGH", "CRITICAL"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Data Sensitivity">
            <select name="dataSensitivity" className={inputClass} defaultValue="INTERNAL">
              {["PUBLIC", "INTERNAL", "CONFIDENTIAL", "RESTRICTED"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Production Status">
            <select name="productionStatus" className={inputClass} defaultValue="DEVELOPMENT">
              {["CONCEPT", "DEVELOPMENT", "PILOT", "PRODUCTION", "RETIRED"].map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
          <label className="flex items-center gap-2 text-sm text-slate-700 md:col-span-2">
            <input type="checkbox" name="customerFacing" className="rounded border-slate-300" />
            Customer Facing
          </label>
          <div className="md:col-span-2">
            <button type="submit" className="rounded-md bg-teal-800 px-4 py-2 text-sm font-medium text-white hover:bg-teal-900">
              Register AI System
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}

const inputClass =
  "mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-700 focus:ring-1 focus:ring-teal-700";

function Field({
  label,
  name,
  required,
  children,
  className,
}: {
  label: string;
  name?: string;
  required?: boolean;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block text-xs font-medium text-slate-500 ${className ?? ""}`}>
      {label}
      {children ?? <input name={name} required={required} className={inputClass} />}
    </label>
  );
}
