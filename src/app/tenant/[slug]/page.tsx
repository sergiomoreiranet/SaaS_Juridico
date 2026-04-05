import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients, cases, deadlines, users } from "@/db/schema";
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
    id: i + 1,
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

  const rawDeadlines = await db
    .select()
    .from(deadlines)
    .where(
      and(
        eq(deadlines.tenantId, user.tenantId),
        gte(deadlines.dueDate, todayStart),
        lt(deadlines.dueDate, tomorrowEnd)
      )
    )
    .orderBy(deadlines.dueDate);

  const calendarEvents = {
    today: rawDeadlines.filter(d => new Date(d.dueDate) < todayEnd).map(d => ({
      time: new Date(d.dueDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      title: d.description,
      color: d.isUrgent ? "bg-red-900" : "bg-[#cca77b]"
    })),
    tomorrow: rawDeadlines.filter(d => new Date(d.dueDate) >= todayEnd).map(d => ({
      time: new Date(d.dueDate).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      title: d.description,
      color: "bg-zinc-600"
    }))
  };

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <DashboardClientView 
        totalClients={totalClients} 
        totalActiveCases={totalActiveCases}
        recentCases={formattedCases}
        calendarEvents={calendarEvents}
      />
    </div>
  );
}
