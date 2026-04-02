import { db } from "@/db";
import { clients, tenants } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import ClienteDashboard from "./ClienteDashboard";

export default async function DetalhesClientePage({ params }: { params: Promise<{ slug: string, id: string }> }) {
  const { slug, id } = await params;
  const user = await requireUser();
  const tenantId = (user as any).tenantId;

  // Carrega o cliente atrelado ao tenant do usuário
  const clientData = await db.query.clients.findFirst({
    where: and(
      eq(clients.id, id),
      eq(clients.tenantId, tenantId)
    )
  });

  if (!clientData) {
    return notFound();
  }

  return <ClienteDashboard client={clientData} slug={slug} />;
}
