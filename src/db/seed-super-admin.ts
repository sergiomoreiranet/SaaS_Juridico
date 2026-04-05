/**
 * Script para criar/atualizar o Super Admin do SaaS no banco de dados.
 *
 * O Super Admin é identificado pelo e-mail SUPER_ADMIN_EMAIL do .env.
 * Como a tabela users exige tenantId (NOT NULL), criamos um tenant
 * "sistema" fixo com UUID reservado para esse fim.
 *
 * Uso: npx tsx src/db/seed-super-admin.ts
 */
import "dotenv/config";
import { db } from "./index";
import { tenants, users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

// UUIDs fixos e reservados para o Super Admin (nunca reutilizar em outros registros)
const SYSTEM_TENANT_ID = "00000000-0000-0000-0000-000000000001";
const SUPER_ADMIN_ID   = "00000000-0000-0000-0000-000000000002";

// Senha inicial — altere após o primeiro login!
const INITIAL_PASSWORD = "Admin@2026";

async function seedSuperAdmin() {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;

  if (!superAdminEmail) {
    console.error("❌ SUPER_ADMIN_EMAIL não definido no .env");
    process.exit(1);
  }

  console.log("\n🚀 Configurando Super Admin do SaaS...");
  console.log(`   E-mail: ${superAdminEmail}`);

  const passwordHash = await bcrypt.hash(INITIAL_PASSWORD, 12);

  try {
    // 1. Cria o tenant "Sistema" reservado (ignora se já existir)
    await db
      .insert(tenants)
      .values({
        id:     SYSTEM_TENANT_ID,
        name:   "Sistema (Super Admin)",
        slug:   "sistema",
        plan:   "elite",
        status: "active",
      })
      .onConflictDoNothing();

    console.log("   ✅ Tenant sistema verificado.");

    // 2. Verifica se o super admin já existe
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, superAdminEmail))
      .limit(1);

    if (existing.length > 0) {
      // Já existe → apenas atualiza a senha (útil para "reset de acesso")
      await db
        .update(users)
        .set({ password: passwordHash })
        .where(eq(users.email, superAdminEmail));

      console.log("   ✅ Super Admin já existia. Senha atualizada.");
    } else {
      // Não existe → cria do zero
      await db.insert(users).values({
        id:       SUPER_ADMIN_ID,
        tenantId: SYSTEM_TENANT_ID,
        email:    superAdminEmail,
        password: passwordHash,
        name:     "Super Administrador",
        role:     "admin",
      });

      console.log("   ✅ Super Admin criado com sucesso.");
    }

    console.log("\n══════════════════════════════════════");
    console.log("  🔑 CREDENCIAIS DE ACESSO");
    console.log("══════════════════════════════════════");
    console.log(`  URL   : http://localhost:3000/login`);
    console.log(`  Email : ${superAdminEmail}`);
    console.log(`  Senha : ${INITIAL_PASSWORD}`);
    console.log("══════════════════════════════════════");
    console.log("  ⚠️  Altere a senha após o primeiro login!\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro ao criar Super Admin:", error);
    process.exit(1);
  }
}

seedSuperAdmin();
