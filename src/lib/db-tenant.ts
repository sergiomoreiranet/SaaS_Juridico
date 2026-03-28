import { db } from "../db";
import { sql } from "drizzle-orm";

/**
 * Middleware fundamental da arquitetura Multi-tenant.
 * 
 * Envolve a operação (callback) em uma transação SQL e injeta
 * a variável de sessão `app.current_tenant` antes de rodar a query.
 * O RLS no PostgreSQL (Supabase) fará a validação em cima dessa variável
 * de forma nativa e impossível de ser burlada dentro do ORM.
 */
export async function withTenant<T>(
  tenantId: string,
  callback: (tx: typeof db) => Promise<T>
): Promise<T> {
  return await db.transaction(async (tx) => {
    // Setando varíavel na transação (true = escopo apenas para essa transação)
    await tx.execute(
      sql`SELECT set_config('app.current_tenant', ${tenantId}, true)`
    );
    
    // Executa a operação que o usuário pediu, agora com RLS ativado
    return await callback(tx as any);
  });
}
