import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { prisma } from "./prisma";
import { ROLE_PERMISSIONS } from "./constants";

const ROLE_DEFAULT_USERS: Record<UserRole, string> = {
  EXECUTIVE: "elena.vasquez@contoso.com",
  AI_GOVERNANCE_MANAGER: "marcus.chen@contoso.com",
  BUSINESS_OWNER: "sarah.mitchell@contoso.com",
  TECHNICAL_OWNER: "david.chen@contoso.com",
  RISK_COMPLIANCE: "claire.dubois@contoso.com",
  AUDITOR: "robert.hayes@contoso.com",
};

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get("aigov_role")?.value as UserRole | undefined;
  const role: UserRole = roleCookie && ROLE_DEFAULT_USERS[roleCookie] ? roleCookie : "AI_GOVERNANCE_MANAGER";
  const email = ROLE_DEFAULT_USERS[role];
  const user =
    (await prisma.user.findUnique({ where: { email }, include: { businessUnit: true } })) ??
    (await prisma.user.findFirst({ include: { businessUnit: true } }));

  return {
    role,
    user,
    permissions: ROLE_PERMISSIONS[role],
  };
}
