import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Tabela de tenants inicial (será melhorada na fase 1-B2)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  plan: text("plan").notNull().default("free"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
