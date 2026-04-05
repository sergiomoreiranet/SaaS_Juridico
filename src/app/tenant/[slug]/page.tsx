import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients, cases, deadlines, users, tenants } from "@/db/schema";
import { eq, count, desc, and, gte, lt } from "drizzle-orm";
import { DashboardClientView } from "./DashboardClientView";

export default async function DashboardPage() {
  // Chamada Server-Side pura: Vai bater no JWT e recusar automaticamente se for intruso
  const authUser = await requireUser().catch(() => null);
  
  if (!authUser) {
    redirect("/login");
  }

  // Casting para forçar o Typescript a reconhecer campos customizados injetados no JWT
  const user = authUser as any;

  // Informações do Tenant
  const [tenantInfo] = await db
    .select({ status: tenants.status, trialEndsAt: tenants.trialEndsAt })
    .from(tenants)
    .where(eq(tenants.id, user.tenantId));

  // KPIs Reais
  const [clientCountData] = await db
    .select({ value: count() })
    .from(clients)
    .where(eq(clients.tenantId, user.tenantId));
  const totalClients = clientCountData.value;

  const [activeCasesData] = await db
    .select({ value: count() })
    .from(cases)
    .where(and(eq(cases.tenantId, user.tenantId), eq(cases.status, "ativo")));
  const totalActiveCases = activeCasesData.value;

  // Casos Recentes com JOIN de Clientes e Advogado
  const fetchedCases = await db
    .select({
      id: cases.id,
      name: cases.title,
      client: clients.name,
      status: cases.status,
      due: cases.createdAt,
      lead: users.name
    })
    .from(cases)
    .leftJoin(clients, eq(cases.clientId, clients.id))
    .leftJoin(users, eq(cases.lawyerId, users.id))
    .where(eq(cases.tenantId, user.tenantId))
    .orderBy(desc(cases.createdAt))
    .limit(5);

  const formattedCases = fetchedCases.map((c, i) => ({
    id: c.id,
    name: c.name,
    client: c.client?.split(" ")[0] || "Sem Cliente",
    status: c.status === "ativo" ? "Ativo" : c.status === "pendente" ? "Pendente" : "Fechado",
    due: new Date(c.due).toLocaleDateString("pt-BR"),
    lead: c.lead?.split(" ")[0] || "Não Atribuído"
  }));

  // Calendário e Prazos Reais
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayStart.getDate() + 1);

  const tomorrowEnd = new Date(todayEnd);
  tomorrowEnd.setDate(todayEnd.getDate() + 1);

  // Busca todos os prazos pendentes ou recentes do tenant com o nome do caso associado
  const rawDeadlines = await db
    .select({
      id: deadlines.id,
      description: deadlines.description,
      dueDate: deadlines.dueDate,
      isUrgent: deadlines.isUrgent,
      isCompleted: deadlines.isCompleted,
      caseId: deadlines.caseId,
      caseTitle: cases.title
    })
    .from(deadlines)
    .leftJoin(cases, eq(deadlines.caseId, cases.id))
    .where(
      and(
        eq(deadlines.tenantId, user.tenantId),
        eq(deadlines.isCompleted, false)
      )
    )
    .orderBy(deadlines.dueDate);

  // Classifica prazos em categorias
  const calendarEvents = {
    atrasados: rawDeadlines.filter(d => new Date(d.dueDate) < todayStart).map(d => ({
      ...d,
      time: new Date(d.dueDate).toLocaleDateString("pt-BR"),
      title: d.description,
      color: "bg-red-900",
      caseId: d.caseId,
      caseName: d.caseTitle || "Processo"
    })),
    today: rawDeadlines.filter(d => {
      const dDate = new Date(d.dueDate);
      return dDate >= todayStart && dDate < todayEnd;
    }).map(d => ({
      ...d,
      time: new Date(d.dueDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      title: d.description,
      color: d.isUrgent ? "bg-red-900" : "bg-[#cca77b]",
      caseId: d.caseId,
      caseName: d.caseTitle || "Processo"
    })),
    tomorrow: rawDeadlines.filter(d => {
      const dDate = new Date(d.dueDate);
      return dDate >= todayEnd && dDate < tomorrowEnd;
    }).map(d => ({
      ...d,
      time: new Date(d.dueDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      title: d.description,
      color: "bg-zinc-600",
      caseId: d.caseId,
      caseName: d.caseTitle || "Processo"
    }))
  };

  // Prazos Urgentes (isUrgent e nao completados) limit 5
  const urgentDeadlines = rawDeadlines
    .filter(d => d.isUrgent)
    .slice(0, 5)
    .map(d => ({
      id: d.id,
      description: d.description,
      dueDate: new Date(d.dueDate).toLocaleDateString("pt-BR"),
      caseName: d.caseTitle || "Desconhecido",
      caseId: d.caseId
    }));

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <DashboardClientView 
        tenantInfo={{
          status: tenantInfo?.status || "pending",
          trialEndsAt: tenantInfo?.trialEndsAt ? tenantInfo.trialEndsAt.toISOString() : null
        }}
        totalClients={totalClients} 
        totalActiveCases={totalActiveCases}
        overdueCount={calendarEvents.atrasados.length}
        recentCases={formattedCases}
        urgentDeadlines={urgentDeadlines}
        calendarEvents={calendarEvents}
      />
    </div>
  );
}
