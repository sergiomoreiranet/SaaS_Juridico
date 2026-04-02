"use server";

import { db } from "@/db";
import { actionTypes, courts } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function createActionType(name: string) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;
    if (!tenantId) throw new Error("Sem escritório associado.");
    if (!name.trim()) throw new Error("O nome não pode ser vazio.");

    await db.insert(actionTypes).values({
      tenantId,
      name: name.trim()
    });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}

export async function createCourt(name: string, acronym: string, uf: string) {
  try {
    const user = await requireUser();
    if ((user as any).role !== "admin") throw new Error("Apenas admins podem criar tribunais.");
    if (!name.trim() || !acronym.trim() || !uf.trim()) throw new Error("Todos os campos do tribunal são obrigatórios.");

    await db.insert(courts).values({
      name: name.trim(),
      acronym: acronym.trim(),
      uf: uf.trim()
    });
    revalidatePath("/configuracoes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
