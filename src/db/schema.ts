import { pgTable, text, timestamp, uuid, pgEnum, index, jsonb, boolean, primaryKey } from "drizzle-orm/pg-core";

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
  additionalContacts: jsonb("additional_contacts"), // { type: "phone" | "email", value: "..." }[]
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

// Tabela de Tribunais (Catálogo Global)
export const courts = pgTable("courts", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: text("code"),                 // ex: 8.26
  name: text("name").notNull(),       // ex: Tribunal de Justiça do Estado de São Paulo
  abbreviation: text("abbreviation"), // ex: TJSP
  type: text("type"),                 // estadual, federal, trabalho, eleitoral, superior
  state: text("state"),               // ex: SP
  city: text("city"),                 // ex: São Paulo
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


// Enumeração de Status do Caso
export const caseStatusEnum = pgEnum("case_status", ["ativo", "pendente", "fechado"]);

// Tabela de Casos (Processos)
export const cases = pgTable("cases", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  lawyerId: uuid("lawyer_id")
    .references(() => users.id, { onDelete: "set null" }), // Advogado responsável
  actionTypeId: uuid("action_type_id")
    .references(() => actionTypes.id, { onDelete: "set null" }),
  title: text("title").notNull(),
  cnjNumber: text("cnj_number"),
  controlNumber: text("control_number"),
  tr: text("tr"),
  origin: text("origin"),
  processClass: text("process_class"),
  processType: text("process_type"),
  courtId: uuid("court_id").references(() => courts.id, { onDelete: "set null" }),
  forum: text("forum"), // Adicionado de volta para separar Foro
  courtDepartmentId: uuid("court_department_id").references(() => courtDepartments.id, { onDelete: "set null" }), // Representa a Vara
  subject: text("subject"),
  estimatedValue: text("estimated_value"),
  movementDate: text("movement_date"),
  startDate: text("start_date"),
  distributionDate: text("distribution_date"),
  expectedConclusionDate: text("expected_conclusion_date"),
  status: caseStatusEnum("status").default("ativo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    casesTenantIdx: index("cases_tenant_id_idx").on(table.tenantId),
  };
});

// Tabela de Prazos
export const deadlines = pgTable("deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  caseId: uuid("case_id")
    .notNull()
    .references(() => cases.id, { onDelete: "cascade" }),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  isUrgent: boolean("is_urgent").default(false).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    deadlinesTenantIdx: index("deadlines_tenant_id_idx").on(table.tenantId),
  };
});

// Tabela de Tarefas
export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id")
    .notNull()
    .references(() => tenants.id, { onDelete: "cascade" }),
  caseId: uuid("case_id")
    .references(() => cases.id, { onDelete: "cascade" }), // Pode estar associada a um caso ou não
  assigneeId: uuid("assignee_id")
    .references(() => users.id, { onDelete: "set null" }), // Usuário responsável
  description: text("description").notNull(),
  dueDate: timestamp("due_date"),
  isCompleted: boolean("is_completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
  return {
    tasksTenantIdx: index("tasks_tenant_id_idx").on(table.tenantId),
  };
});

// Tabela de Órgãos Julgadores (Varas/Foros)
export const courtDepartments = pgTable("court_departments", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  courtId: uuid("court_id").references(() => courts.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
});

// Tabela de Andamentos (Histórico do Processo)
export const caseMovements = pgTable("case_movements", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  date: timestamp("date").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Documentos do Processo
export const caseDocuments = pgTable("case_documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  tenantId: uuid("tenant_id").notNull().references(() => tenants.id, { onDelete: "cascade" }),
  caseId: uuid("case_id").notNull().references(() => cases.id, { onDelete: "cascade" }),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tabela de Junção para Litisconsórcio / Co-participantes
export const caseClients = pgTable("case_clients", {
  processId: uuid("process_id").references(() => cases.id, { onDelete: "cascade" }).notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  type: text("type").default("Litisconsorte").notNull(), // Herdeiro, Litisconsorte, etc.
}, (t) => [
  primaryKey({ columns: [t.processId, t.clientId] }),
]);
