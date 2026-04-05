"use server";

import { db } from "@/db";
import { cases, courtDepartments, caseClients } from "@/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

async function getOrCreateCourtDepartmentId(tenantId: string, courtId: string | null, name: string) {
  if (!name || name.trim() === "") return null;
  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(name);
  if (isUUID) return name;

  const conditions = [
    eq(courtDepartments.tenantId, tenantId),
    eq(courtDepartments.name, name)
  ];
  if (courtId) {
    conditions.push(eq(courtDepartments.courtId, courtId));
  } else {
    conditions.push(isNull(courtDepartments.courtId));
  }

  const existing = await db.select().from(courtDepartments).where(and(...conditions)).limit(1);

  if (existing.length > 0) return existing[0].id;

  const inserted = await db.insert(courtDepartments).values({
    tenantId,
    courtId: courtId || null,
    name
  }).returning({ id: courtDepartments.id });

  return inserted[0].id;
}


export async function createCase(data: any) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;
    if (!tenantId) return { error: "Usuário não vinculado a um escritório." };

    const resolvedCourtDepId = await getOrCreateCourtDepartmentId(tenantId, data.courtId, data.courtDepartmentId);

    const insertedCase = await db.insert(cases).values({
      tenantId,
      clientId: data.clientId,
      lawyerId: data.lawyerId || (user as any).id,
      actionTypeId: data.actionTypeId || null,
      title: data.title,
      cnjNumber: data.cnjNumber || null,
      controlNumber: data.controlNumber || null,
      tr: data.tr || null,
      origin: data.origin || null,
      processClass: data.processClass || null,
      processType: data.processType || null,
      courtId: data.courtId || null,
      forum: data.forum || null,
      courtDepartmentId: resolvedCourtDepId,
      subject: data.subject || null,
      estimatedValue: data.estimatedValue || null,
      movementDate: data.movementDate || null,
      startDate: data.startDate || null,
      distributionDate: data.distributionDate || null,
      expectedConclusionDate: data.expectedConclusionDate || null,
      status: data.status || "ativo",
    }).returning({ id: cases.id });

    const newCaseId = insertedCase[0].id;

    // Salvar Participantes Adicionais (Herdeiros/Litisconsortes) na tabela associativa
    if (data.coClients && Array.isArray(data.coClients) && data.coClients.length > 0) {
      const caseClientsData = data.coClients.map((co: { clientId: string, type: string }) => ({
        processId: newCaseId,
        clientId: co.clientId,
        type: co.type || "Litisconsorte"
      }));
      await db.insert(caseClients).values(caseClientsData);
    }

    revalidatePath(`/tenant/[slug]/processos`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar caso:", error);
    return { error: "Erro interno: " + (error?.message || String(error)) };
  }
}

export async function updateCase(caseId: string, data: any) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    const resolvedCourtDepId = await getOrCreateCourtDepartmentId(tenantId, data.courtId, data.courtDepartmentId);

    await db.update(cases)
      .set({
        clientId: data.clientId,
        lawyerId: data.lawyerId || (user as any).id,
        actionTypeId: data.actionTypeId || null,
        title: data.title,
        cnjNumber: data.cnjNumber || null,
        controlNumber: data.controlNumber || null,
        tr: data.tr || null,
        origin: data.origin || null,
        processClass: data.processClass || null,
        processType: data.processType || null,
        courtId: data.courtId || null,
        forum: data.forum || null,
        courtDepartmentId: resolvedCourtDepId,
        subject: data.subject || null,
        estimatedValue: data.estimatedValue || null,
        movementDate: data.movementDate || null,
        startDate: data.startDate || null,
        distributionDate: data.distributionDate || null,
        expectedConclusionDate: data.expectedConclusionDate || null,
        status: data.status,
      })
      .where(and(eq(cases.id, caseId), eq(cases.tenantId, tenantId)));

    // Atualizar Litisconsortes (Limpar anteriores e inserir novos)
    await db.delete(caseClients).where(eq(caseClients.processId, caseId));
    
    if (data.coClients && Array.isArray(data.coClients) && data.coClients.length > 0) {
      const caseClientsData = data.coClients.map((co: { clientId: string, type: string }) => ({
        processId: caseId,
        clientId: co.clientId,
        type: co.type || "Litisconsorte"
      }));
      await db.insert(caseClients).values(caseClientsData);
    }

    revalidatePath(`/tenant/[slug]/processos`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao atualizar caso:", error);
    return { error: "Erro interno: " + (error?.message || String(error)) };
  }
}

export async function toggleCaseStatus(caseId: string, currentStatus: "ativo" | "fechado" | "pendente") {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    const newStatus = currentStatus === "ativo" ? "fechado" : "ativo";

    await db.update(cases)
      .set({ status: newStatus })
      .where(and(eq(cases.id, caseId), eq(cases.tenantId, tenantId)));

    revalidatePath(`/tenant/[slug]/processos`, "page");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    return { error: "Erro interno ao alterar status do caso." };
  }
}
