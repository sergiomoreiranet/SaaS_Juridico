import "dotenv/config";
import { db } from "./index";
import { users, clients, cases, deadlines, tenants } from "./schema";
import { eq } from "drizzle-orm";

async function run() {
  console.log("🌱 Executando seed de Dashboard para a Sueli...");

  const sueliEmail = "teste@hotmail.com";
  const userRows = await db.select().from(users).where(eq(users.email, sueliEmail)).limit(1);
  
  if (userRows.length === 0) {
    console.error("❌ Sueli não encontrada.");
    process.exit(1);
  }

  const sueli = userRows[0];
  const tenantId = sueli.tenantId;

  // 1. Criar alguns clientes de teste se não existirem
  const insertedClients = await db.insert(clients).values([
    { tenantId, name: "Maria Oliveira Silva", email: "maria@teste.com", phone: "(11) 98888-7777" },
    { tenantId, name: "Empresa XPTO Ltda", personType: "PJ", email: "contato@xpto.com", phone: "(11) 3333-4444" },
    { tenantId, name: "João Pedro Santos", email: "joao.pedro@teste.com", phone: "(11) 95555-1234" }
  ]).returning();

  console.log(`✅ ${insertedClients.length} Clientes criados.`);

  // 2. Criar Casos/Processos
  const insertedCases = await db.insert(cases).values([
    {
      tenantId,
      clientId: insertedClients[0].id,
      lawyerId: sueli.id,
      title: "Divórcio Litigioso",
      cnjNumber: "0001234-56.2023.8.26.0001",
      status: "ativo"
    },
    {
      tenantId,
      clientId: insertedClients[1].id,
      lawyerId: sueli.id,
      title: "Assessoria Contratual Anual",
      status: "pendente"
    },
    {
      tenantId,
      clientId: insertedClients[2].id,
      lawyerId: sueli.id,
      title: "Ação Trabalhista - Horas Extras",
      cnjNumber: "1000987-12.2024.5.02.0010",
      status: "ativo"
    }
  ]).returning();

  console.log(`✅ ${insertedCases.length} Casos criados.`);

  // 3. Criar Prazos (agenda da semana)
  // Hoje e Amanhã
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  await db.insert(deadlines).values([
    {
      tenantId,
      caseId: insertedCases[0].id,
      description: "Audiência de Conciliação Virtual",
      dueDate: today,
      isUrgent: true,
    },
    {
      tenantId,
      caseId: insertedCases[1].id,
      description: "Revisar cláusula 4 do Contrato XYZ",
      dueDate: today,
      isUrgent: false,
    },
    {
      tenantId,
      caseId: insertedCases[2].id,
      description: "Protocolar manifestação ao laudo pericial",
      dueDate: tomorrow,
      isUrgent: true,
    }
  ]);

  console.log(`✅ Prazos criados.`);
  console.log("🎉 Seed finalizado!");
  process.exit(0);
}

run().catch(console.error);
