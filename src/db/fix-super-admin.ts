/**
 * Corrige o tenantId do Super Admin para apontar para o tenant "Sistema".
 * Também corrige o nome caso esteja incorreto.
 */
import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

const SYSTEM_TENANT_ID  = "00000000-0000-0000-0000-000000000001";
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL!;

async function fixSuperAdmin() {
  console.log("\n🔧 Corrigindo Super Admin no banco...");
  console.log(`   E-mail: ${SUPER_ADMIN_EMAIL}`);

  const result = await db
    .update(users)
    .set({
      tenantId: SYSTEM_TENANT_ID,
      name:     "Super Administrador",
      role:     "admin",
    })
    .where(eq(users.email, SUPER_ADMIN_EMAIL))
    .returning({ id: users.id, email: users.email, tenantId: users.tenantId, name: users.name });

  if (result.length === 0) {
    console.error("❌ Usuário não encontrado no banco.");
    process.exit(1);
  }

  console.log("✅ Super Admin corrigido:");
  console.log(`   ID       : ${result[0].id}`);
  console.log(`   Nome     : ${result[0].name}`);
  console.log(`   tenantId : ${result[0].tenantId}  ← Sistema (Super Admin)`);
  process.exit(0);
}

fixSuperAdmin().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
