import { db } from "@/db";
import { actionTypes, courts } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { eq, desc } from "drizzle-orm";
import ConfigClientPage from "./ConfigClientPage";

export default async function ConfiguracoesPage() {
  const user = await requireUser();
  const tenantId = (user as any).tenantId;

  const [tenantActionTypes, allCourts] = await Promise.all([
    db.select().from(actionTypes).where(eq(actionTypes.tenantId, tenantId)).orderBy(desc(actionTypes.createdAt)),
    db.select().from(courts).orderBy(desc(courts.createdAt))
  ]);

  return <ConfigClientPage actionTypes={tenantActionTypes} courts={allCourts} userRole={(user as any).role} />;
}
