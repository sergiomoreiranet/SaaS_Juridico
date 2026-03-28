import { pgTable, text, timestamp, uuid, pgEnum, index } from "drizzle-orm/pg-core";

// Enumeração global de Permissões
export const roleEnum = pgEnum("role", ["admin", "advogado", "estagiario"]);

// Tabela de Escritórios
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Perfil dos Usuários (Advogados, Estagiários, etc)
export const users = pgTable("users", {
  id: uuid("id").primaryKey(), // Esse ID virá do Auth nativo do Supabase (auth.users)
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }), // Impede que existam usuários "soltos" sem escritório
  email: text("email").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("advogado").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    // Índice composto valioso para buscas rápidas isolando por escritório
    tenantIdIdx: index("users_tenant_id_idx").on(table.tenantId, table.id),
  };
});
