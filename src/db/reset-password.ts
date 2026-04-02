/**
 * Script utilitário para resetar a senha de um usuário diretamente no banco.
 * Uso: npx tsx src/db/reset-password.ts
 */
import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

const TARGET_EMAIL = "ser-moreira@hotmail.com";
const NEW_PASSWORD = "Admin@2026";

async function resetPassword() {
  console.log(`\n🔑 Resetando senha do usuário: ${TARGET_EMAIL}`);

  const hash = await bcrypt.hash(NEW_PASSWORD, 12);

  const result = await db
    .update(users)
    .set({ password: hash })
    .where(eq(users.email, TARGET_EMAIL))
    .returning({ id: users.id, email: users.email });

  if (result.length === 0) {
    console.error("❌ Usuário não encontrado no banco.");
    process.exit(1);
  }

  console.log("✅ Senha resetada com sucesso!");
  console.log(`   E-mail: ${TARGET_EMAIL}`);
  console.log(`   Nova senha: ${NEW_PASSWORD}`);
  process.exit(0);
}

resetPassword().catch((e) => {
  console.error("❌ Erro:", e);
  process.exit(1);
});
