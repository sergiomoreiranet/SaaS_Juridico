import "dotenv/config";
import { db } from "./index";
import { sql } from "drizzle-orm";

/**
 * Script utilitário para ativar o Row Level Security (RLS)
 * e criar as Políticas de Acesso restritivo.
 */
async function setupRLS() {
  console.log("⏳ Ativando RLS nas tabelas tenants e users...");
  try {
    // 1. Força a ativação do RLS nas duas tabelas
    await db.execute(sql`ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;`);
    await db.execute(sql`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;`);

    // 2. Cria a função de segurança (Security Definer) que lê o tenant_id da sessão ou injetado via JWT
    await db.execute(sql`
      CREATE OR REPLACE FUNCTION get_app_tenant_id() RETURNS uuid
      LANGUAGE sql STABLE AS $$
        -- Tenta pegar do JWT do Supabase primeiro, se não encontrar pega da variável customizada de banco
        SELECT COALESCE(
          nullif(current_setting('request.jwt.claims', true)::json->>'tenant_id', '')::uuid,
          nullif(current_setting('app.current_tenant', true), '')::uuid
        );
      $$;
    `);

    // 3. Deleta as regras antigas caso já existam (para rodar o script livremente)
    await db.execute(sql`DROP POLICY IF EXISTS "tenant_isolation" ON "tenants";`);
    await db.execute(sql`DROP POLICY IF EXISTS "user_isolation" ON "users";`);

    // 4. Criação da RLS Policy na tabela tenants (só pode ler/escrever onde ID = get_app_tenant_id)
    await db.execute(sql`
      CREATE POLICY "tenant_isolation" ON "tenants"
      FOR ALL USING (id = get_app_tenant_id());
    `);

    // 5. Criação da RLS Policy na tabela users (só pode ler/escrever usuários do SEU tenant_id)
    await db.execute(sql`
      CREATE POLICY "user_isolation" ON "users"
      FOR ALL USING (tenant_id = get_app_tenant_id());
    `);

    console.log("✅ RLS Ativado e Políticas de Isolamento Multi-tenant geradas com sucesso.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Erro ao configurar RLS:", err);
    process.exit(1);
  }
}

setupRLS();
