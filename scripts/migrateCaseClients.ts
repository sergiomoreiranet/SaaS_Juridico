import { db } from "../src/db";
import { sql } from "drizzle-orm";

async function run() {
  try {
    console.log("Criando tabela case_clients...");
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS case_clients (
        process_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
        client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        PRIMARY KEY (process_id, client_id)
      );
    `);
    console.log("Migração de Litisconsórcio finalizada com sucesso!");
    process.exit(0);
  } catch (error) {
    console.error("Erro na migração:", error);
    process.exit(1);
  }
}

run();
