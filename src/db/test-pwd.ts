import "dotenv/config";
import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

async function run() {
  console.log("Verificando se a senha é '123456' para os usuários da Sueli...\n");

  const emailSueli = "teste@hotmail.com";
  const userSueli = await db.select().from(users).where(eq(users.email, emailSueli)).limit(1);
  
  if (userSueli.length > 0) {
    const match = await bcrypt.compare("123456", userSueli[0].password);
    console.log(`- Conta: ${emailSueli}`);
    console.log(`- A senha '123456' está CORRETA? --> ${match ? "✅ SIM" : "❌ NÃO"}\n`);
  } else {
    console.log(`Usuário ${emailSueli} não encontrado.`);
  }

  const emailSerginho = "serginhosiloliveira@gmail.com";
  const userSerginho = await db.select().from(users).where(eq(users.email, emailSerginho)).limit(1);
  
  if (userSerginho.length > 0) {
    const match2 = await bcrypt.compare("123456", userSerginho[0].password);
    console.log(`- Conta: ${emailSerginho} (Estagiário)`);
    console.log(`- A senha '123456' está CORRETA? --> ${match2 ? "✅ SIM" : "❌ NÃO"}`);
  }

  process.exit(0);
}

run();
