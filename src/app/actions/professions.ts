"use server";

import { db } from "@/db";
import { professions } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { eq, or, isNull, and } from "drizzle-orm";

export async function getProfessions() {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    if (!tenantId) {
      // Retorna apenas globais se não houver tenant logado
      const data = await db.query.professions.findMany({
        where: isNull(professions.tenantId),
        orderBy: (prof, { asc }) => [asc(prof.name)],
      });
      return { data };
    }

    // Retorna globais + profissões do tenant
    const data = await db.query.professions.findMany({
      where: or(
        isNull(professions.tenantId),
        eq(professions.tenantId, tenantId)
      ),
      orderBy: (prof, { asc }) => [asc(prof.name)],
    });

    return { data };
  } catch (error: any) {
    return { error: error.message || "Erro ao buscar profissões." };
  }
}

export async function createCustomProfession(name: string) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;

    if (!tenantId) {
      throw new Error("Usuário não associado a um escritório.");
    }

    if (!name || name.trim().length < 2) {
      throw new Error("Nome da profissão inválido.");
    }

    const upperName = name.trim().toUpperCase();

    // Check se já existe global ou local para não duplicar bobagem
    const existing = await db.query.professions.findFirst({
      where: and(
        eq(professions.name, upperName),
        or(
          isNull(professions.tenantId),
          eq(professions.tenantId, tenantId)
        )
      )
    });

    if (!existing) {
      await db.insert(professions).values({
        tenantId,
        name: upperName,
      });
    }

    revalidatePath("/clientes");
    return { success: true, name: upperName };
  } catch (error: any) {
    return { error: error.message || "Erro ao criar profissão." };
  }
}
