import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import ClientesClientPage from "./ClientesClientPage";

export default async function ClientesPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const tenantId = (user as any).tenantId;

  if (!tenantId) {
    return <div className="p-10 text-white">Erro: Seu usuário não está vinculado a nenhum escritório, logo não tem permissão para visualizar clientes.</div>;
  }

  // Busca inicial dos clientes do escritório (tenant) daquele usuário autenticado
  const data = await db
    .select()
    .from(clients)
    .where(eq(clients.tenantId, tenantId))
    .orderBy(desc(clients.createdAt));

  return <ClientesClientPage initialData={data} slug={slug} />;
}
