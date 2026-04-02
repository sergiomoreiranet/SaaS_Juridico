import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminClientPage from "./AdminClientPage";

async function getTenants() {
  const allTenants = await db
    .select({
      id: tenants.id,
      name: tenants.name,
      slug: tenants.slug,
      plan: tenants.plan,
      status: tenants.status,
      trialEndsAt: tenants.trialEndsAt,
      createdAt: tenants.createdAt,
      userName: users.name,
      userEmail: users.email,
      userOab: users.oab,
      userPhone: users.phone,
    })
    .from(tenants)
    .leftJoin(users, eq(users.tenantId, tenants.id))
    .orderBy(desc(tenants.createdAt));

  return allTenants;
}

export default async function AdminPage() {
  // ── Proteção Server-Side ──────────────────────────────────────────
  // Verifica sessão ativa. Se não houver, manda para o login.
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Verifica se o usuário logado é o Super Admin do SaaS.
  // A flag isSuperAdmin é definida no JWT em auth.ts,
  // comparando o email com a variável SUPER_ADMIN_EMAIL do .env
  const isSuperAdmin = (session.user as any).isSuperAdmin;

  if (!isSuperAdmin) {
    // Usuário autenticado mas NÃO é o Super Admin → 403
    redirect("/403");
  }
  // ─────────────────────────────────────────────────────────────────

  const allTenants = await getTenants();

  const stats = {
    pending: allTenants.filter((t) => t.status === "pending").length,
    trial:   allTenants.filter((t) => t.status === "trial").length,
    active:  allTenants.filter((t) => t.status === "active").length,
    blocked: allTenants.filter((t) => t.status === "blocked").length,
    total:   allTenants.length,
  };

  return <AdminClientPage tenants={allTenants} stats={stats} />;
}
