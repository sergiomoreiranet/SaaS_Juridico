import { requireUser } from "@/lib/session";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { clients } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { DashboardClientView } from "./DashboardClientView";

export default async function DashboardPage() {
  // Chamada Server-Side pura: Vai bater no JWT e recusar automaticamente se for intruso
  const authUser = await requireUser().catch(() => null);
  
  if (!authUser) {
    redirect("/login");
  }

  // Casting para forçar o Typescript a reconhecer campos customizados injetados no JWT
  const user = authUser as any;

  // Busca real no Banco de Dados para a Home! F1-B7 Analytics.
  const [clientCountData] = await db
    .select({ value: count() })
    .from(clients)
    .where(eq(clients.tenantId, user.tenantId));
  
  const totalClients = clientCountData.value;

  return (
    <div className="animate-in fade-in zoom-in-95 duration-500">
      <DashboardClientView totalClients={totalClients} />
    </div>
  );
}
