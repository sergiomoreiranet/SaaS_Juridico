import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import EquipeClientPage from "./EquipeClientPage";

export default async function EquipePage() {
  const sessionUser = await requireUser();
  const tenantId = (sessionUser as any).tenantId;
  const currentUserId = (sessionUser as any).id as string;

  // Busca o role ATUAL do DB (ignora o cache do JWT — evita stale data após promoções)
  const [me] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, currentUserId))
    .limit(1);

  const currentUserRole = me?.role ?? "estagiario";

  // Busca inicial dos advogados/usuários apenas deste escritório
  const data = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      oab: users.oab,
      phone: users.phone,
      additionalContacts: users.additionalContacts,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.tenantId, tenantId))
    .orderBy(desc(users.createdAt));

  return <EquipeClientPage initialData={data} currentUserRole={currentUserRole} currentUserId={currentUserId} />;
}
