import { db } from "@/db";
import { cases, clients, courts, courtDepartments, caseClients } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import ProcessosClientPage from "./ProcessosClientPage";

export default async function ProcessosPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const tenantId = (user as any).tenantId;

  if (!tenantId) {
    return <div className="p-10 text-white">Erro: Seu usuário não está vinculado a nenhum escritório, logo não tem permissão para visualizar processos.</div>;
  }

  // 1. Buscar os Casos com Nome do Cliente e Sigla do Tribunal (JOIN)
  const casesData = await db
    .select({
      id: cases.id,
      title: cases.title,
      cnjNumber: cases.cnjNumber,
      status: cases.status,
      createdAt: cases.createdAt,
      clientId: cases.clientId,
      clientName: clients.name,
      courtId: cases.courtId,
      courtName: courts.abbreviation,
      controlNumber: cases.controlNumber,
      tr: cases.tr,
      origin: cases.origin,
      processClass: cases.processClass,
      processType: cases.processType,
      forum: cases.forum,
      courtDepartmentId: cases.courtDepartmentId,
      courtDepartmentName: courtDepartments.name,
      subject: cases.subject,
      estimatedValue: cases.estimatedValue,
      movementDate: cases.movementDate,
      startDate: cases.startDate,
      distributionDate: cases.distributionDate,
      expectedConclusionDate: cases.expectedConclusionDate,
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .leftJoin(courts, eq(cases.courtId, courts.id))
    .leftJoin(courtDepartments, eq(cases.courtDepartmentId, courtDepartments.id))
    .where(eq(cases.tenantId, tenantId))
    .orderBy(desc(cases.createdAt));

  // 1.5. Buscar Co-Participantes (Herdeiros/Litisconsortes)
  const allCaseClients = await db
    .select({
      processId: caseClients.processId,
      clientId: caseClients.clientId,
      type: caseClients.type,
      clientName: clients.name
    })
    .from(caseClients)
    .innerJoin(cases, eq(caseClients.processId, cases.id))
    .innerJoin(clients, eq(caseClients.clientId, clients.id))
    .where(eq(cases.tenantId, tenantId));

  const enrichedCases = casesData.map(c => ({
    ...c,
    coClients: allCaseClients.filter(co => co.processId === c.id)
  }));


  // 2. Lista de clientes para o Select
  const clientsList = await db
    .select({ id: clients.id, name: clients.name })
    .from(clients)
    .where(eq(clients.tenantId, tenantId))
    .orderBy(clients.name);

  // 3. Lista de tribunais (catálogo global — 25 pré-populados)
  const courtsList = await db
    .select({ id: courts.id, name: courts.name, abbreviation: courts.abbreviation, state: courts.state, type: courts.type, code: courts.code })
    .from(courts)
    .orderBy(courts.name);

  return <ProcessosClientPage initialCases={enrichedCases} clientsList={clientsList} courtsList={courtsList} slug={slug} />;
}
