import "dotenv/config";
import { db } from "./index";
import { tenants, users } from "./schema";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";

async function seed() {
  console.log("🌱 Semeando dados iniciais para testar Login...");
  
  const tenantId = uuidv4();
  const userId = uuidv4();
  const passwordHash = await bcrypt.hash("123456", 10);

  try {
    // Para inserir bypassando RLS, precisamos temporariamente executar como postgres nativo ou
    // desligar RLS ou inserir na tora pois somos superusers no root.
    await db.insert(tenants).values({
      id: tenantId,
      name: "Escritório Modelo",
      slug: "escritorio-modelo",
      plan: "pro",
    });

    await db.insert(users).values({
      id: userId,
      tenantId: tenantId,
      email: "admin@teste.com",
      password: passwordHash,
      name: "Dr. Admin Teste",
      role: "admin",
    });

    console.log("✅ Seed finalizado!");
    console.log("   Login: admin@teste.com");
    console.log("   Senha: 123456");
    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  }
}

seed();
