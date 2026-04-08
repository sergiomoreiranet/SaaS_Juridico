"use server";

import { db } from "@/db";
import { deadlines, tasks, cases } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

// --- DEADLINES ---

export async function createDeadline(data: {
  caseId: string;
  description: string;
  dueDate: Date;
  isUrgent?: boolean;
}) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.insert(deadlines).values({
      tenantId,
      caseId: data.caseId,
      description: data.description,
      dueDate: data.dueDate,
      isUrgent: data.isUrgent || false,
    });

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar prazo:", error);
    return { error: "Erro ao criar prazo." };
  }
}

export async function toggleDeadlineStatus(deadlineId: string, currentStatus: boolean) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.update(deadlines)
      .set({ isCompleted: !currentStatus })
      .where(and(eq(deadlines.id, deadlineId), eq(deadlines.tenantId, tenantId)));

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status do prazo:", error);
    return { error: "Erro interno ao alterar status do prazo." };
  }
}

export async function deleteDeadline(deadlineId: string) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.delete(deadlines).where(and(eq(deadlines.id, deadlineId), eq(deadlines.tenantId, tenantId)));

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Erro interno ao excluir prazo." };
  }
}


// --- TASKS ---

export async function createTask(data: {
  caseId?: string;
  description: string;
  assigneeId?: string;
  dueDate?: Date;
}) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.insert(tasks).values({
      tenantId,
      caseId: data.caseId || null,
      description: data.description,
      assigneeId: data.assigneeId || null,
      dueDate: data.dueDate || null,
    });

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error: any) {
    console.error("Erro ao criar tarefa:", error);
    return { error: "Erro ao criar tarefa." };
  }
}

export async function toggleTaskStatus(taskId: string, currentStatus: boolean) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.update(tasks)
      .set({ isCompleted: !currentStatus })
      .where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)));

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status da tarefa:", error);
    return { error: "Erro interno ao alterar status da tarefa." };
  }
}

export async function deleteTask(taskId: string) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    await db.delete(tasks).where(and(eq(tasks.id, taskId), eq(tasks.tenantId, tenantId)));

    revalidatePath(`/tenant/[slug]/processos/[id]`, "page");
    return { success: true };
  } catch (error) {
    return { error: "Erro interno ao excluir tarefa." };
  }
}
