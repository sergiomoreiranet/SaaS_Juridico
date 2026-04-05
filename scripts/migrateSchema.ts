import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("🔧 Iniciando migração manual do schema...");

  // 1. Tabela courts - renomear colunas e adicionar novos campos
  console.log("📐 Ajustando tabela courts...");
  await db.execute(sql`ALTER TABLE courts ADD COLUMN IF NOT EXISTS code TEXT;`);
  await db.execute(sql`ALTER TABLE courts ADD COLUMN IF NOT EXISTS abbreviation TEXT;`);
  await db.execute(sql`ALTER TABLE courts ADD COLUMN IF NOT EXISTS type TEXT;`);
  await db.execute(sql`ALTER TABLE courts ADD COLUMN IF NOT EXISTS state TEXT;`);
  await db.execute(sql`ALTER TABLE courts ADD COLUMN IF NOT EXISTS city TEXT;`);
  // Migra dados das colunas antigas para as novas antes de dropar
  try { await db.execute(sql`UPDATE courts SET abbreviation = acronym WHERE abbreviation IS NULL AND acronym IS NOT NULL;`); } catch(e) {}
  try { await db.execute(sql`UPDATE courts SET state = uf WHERE state IS NULL AND uf IS NOT NULL;`); } catch(e) {}
  // Remove colunas antigas (podem falhar silenciosamente se não existirem)
  try { await db.execute(sql`ALTER TABLE courts DROP COLUMN IF EXISTS acronym;`); } catch(e) {}
  try { await db.execute(sql`ALTER TABLE courts DROP COLUMN IF EXISTS uf;`); } catch(e) {}
  try { await db.execute(sql`ALTER TABLE courts DROP COLUMN IF EXISTS created_at;`); } catch(e) {}

  // 2. Criar tabela court_departments
  console.log("🏛️ Criando tabela court_departments...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS court_departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
      name TEXT NOT NULL
    );
  `);

  // 3. Criar tabela case_movements
  console.log("📋 Criando tabela case_movements...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS case_movements (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      date TIMESTAMP NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // 4. Criar tabela case_documents
  console.log("📁 Criando tabela case_documents...");
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS case_documents (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
      case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
      file_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW() NOT NULL
    );
  `);

  // 5. Tabela cases - adicionar colunas de FK para courts e court_departments
  console.log("⚖️ Atualizando tabela cases com FKs...");
  await db.execute(sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS court_id UUID REFERENCES courts(id) ON DELETE SET NULL;`);
  await db.execute(sql`ALTER TABLE cases ADD COLUMN IF NOT EXISTS court_department_id UUID REFERENCES court_departments(id) ON DELETE SET NULL;`);
  // Remover colunas de texto que foram substituídas pelas FKs
  await db.execute(sql`ALTER TABLE cases DROP COLUMN IF EXISTS court;`);
  await db.execute(sql`ALTER TABLE cases DROP COLUMN IF EXISTS forum;`);
  await db.execute(sql`ALTER TABLE cases DROP COLUMN IF EXISTS court_department;`);

  console.log("✅ Migração concluída com sucesso!");
  process.exit(0);
}

migrate().catch(e => {
  console.error("❌ Erro na migração:", e);
  process.exit(1);
});
