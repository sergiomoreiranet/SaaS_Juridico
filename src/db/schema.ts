import { pgTable, text, timestamp, uuid, pgEnum, index, jsonb, boolean } from "drizzle-orm/pg-core";

// Enumeração global de Permissões
export const roleEnum = pgEnum("role", ["admin", "advogado", "estagiario"]);

// Enumeração de Status do Escritório
export const tenantStatusEnum = pgEnum("tenant_status", ["pending", "trial", "active", "blocked"]);

// Tabela de Escritórios (Tenants)
export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),           // Nome do escritório (ex: Sueli Pinheiro Advocacia)
  slug: text("slug").notNull().unique(),   // Subdomínio gerado (ex: sueli-pinheiro)
  plan: text("plan").notNull().default("basico"), // basico | pro | elite
  status: tenantStatusEnum("status").notNull().default("pending"),
  trialEndsAt: timestamp("trial_ends_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Usuários do Sistema (Advogados, Estagiários, Admin do escritório)
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),   // Hash bcrypt — nunca armazenar em texto puro
  name: text("name").notNull(),
  image: text("image"),                    // Avatar URL ou Path Local
  oab: text("oab"),                        // Número da OAB (opcional para estagiários)
  phone: text("phone"),                    // WhatsApp/Telefone de contato
  role: roleEnum("role").default("admin").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    tenantIdIdx: index("users_tenant_id_idx").on(table.tenantId, table.id),
  };
});

// Tabela de Clientes
export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  personType: text("person_type").default("PF"), // PF ou PJ
  isActive: boolean("is_active").default(true).notNull(),
  cpfCnpj: text("cpf_cnpj"),
  rgIe: text("rg_ie"),
  birthDate: text("birth_date"),
  gender: text("gender"),
  maritalStatus: text("marital_status"),
  profession: text("profession"),
  nationality: text("nationality"),
  oab: text("oab"),
  indication: text("indication"),
  observations: text("observations"),
  email: text("email"),
  phone: text("phone"), // Telefone principal
  phones: jsonb("phones"), // { type: "Celular", number: "123... "}[]
  
  // Endereço
  cep: text("cep"),
  streetType: text("street_type"),
  street: text("street"),
  number: text("number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    clientTenantIdIdx: index("clients_tenant_id_idx").on(table.tenantId, table.id),
  };
});

// Tabela de Tipos de Ação (Gestão por Escritório)
export const actionTypes = pgTable("action_types", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // ex: "Trabalhista", "Previdenciário"
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    actionTypeTenantIdx: index("action_types_tenant_id_idx").on(table.tenantId),
  };
});

// Tabela de Tribunais (Global)
export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),       // ex: Tribunal de Justiça de São Paulo
  acronym: text("acronym").notNull(), // ex: TJSP
  uf: text("uf").notNull(),           // ex: SP
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Profissões (Global + Local)
export const professions = pgTable("professions", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").references(() => tenants.id, { onDelete: "cascade" }), // null = Global
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    professionsTenantIdx: index("professions_tenant_id_idx").on(table.tenantId),
  };
});

