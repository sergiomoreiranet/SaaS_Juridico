"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

const createUserSchema = z.object({
  name: z.string().min(3, "Nome obrigatório."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha provisória deve ter no mínimo 6 caracteres."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional()
});

export async function createTeamMember(data: z.infer<typeof createUserSchema>) {
  try {
    const sessionUser = await requireUser();
    const tenantId = (sessionUser as any).tenantId;
    const sessionUserId = (sessionUser as any).id as string;
    
    if (!tenantId) {
      throw new Error("Usuário não está associado a nenhum escritório.");
    }

    // Busca role REAL do banco (evita JWT stale após promoções de cargo)
    const [me] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionUserId)).limit(1);
    if (me?.role !== "admin") {
      return { error: "Apenas o administrador do escritório pode criar acessos." };
    }

    const validate = createUserSchema.safeParse(data);
    if (!validate.success) {
      return { error: validate.error.issues[0].message };
    }

    const hashedPassword = await bcrypt.hash(validate.data.password, 10);

    await db.insert(users).values({
      tenantId,
      name: validate.data.name,
      email: validate.data.email,
      password: hashedPassword,
      role: validate.data.role,
      oab: validate.data.oab || null,
      phone: validate.data.phone || null,
    });

    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    if (error.code === '23505') {
      return { error: "Este e-mail já está em uso em nossa base de dados." };
    }
    return { error: error.message || "Erro ao criar membro da equipe." };
  }
}

const updateUserSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(3, "Nome obrigatório."),
  role: z.enum(["admin", "advogado", "estagiario"]),
  oab: z.string().optional(),
  phone: z.string().optional(),
});

export async function updateTeamMember(data: z.infer<typeof updateUserSchema>) {
  try {
    const sessionUser = await requireUser();
    const sessionUserId = (sessionUser as any).id as string;

    // Busca role REAL do banco
    const [me] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionUserId)).limit(1);
    const myRole = me?.role ?? "estagiario";

    const validate = updateUserSchema.safeParse(data);
    if (!validate.success) {
      return { error: validate.error.issues[0].message };
    }

    const targetRole = validate.data.role;

    // ── Busca o role ATUAL do usuário que será editado (target) ──
    const [targetUser] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, validate.data.id))
      .limit(1);

    if (!targetUser) {
      return { error: "Usuário não encontrado." };
    }

    // ── Regras de Hierarquia (server-side, inviolável) ──
    // Estagiário: sem permissão de editar ninguém
    if (myRole === "estagiario") {
      return { error: "Estagiários não têm permissão para editar membros." };
    }

    // Advogado: só pode editar Estagiários (usuários com role INFERIOR)
    if (myRole === "advogado" && targetUser.role !== "estagiario") {
      return { error: "Advogados só podem editar Estagiários." };
    }

    // Advogado: não pode promover ninguém para Admin
    if (myRole === "advogado" && targetRole === "admin") {
      return { error: "Advogados não podem promover para Administrador Geral." };
    }

    // Admin: pode tudo

    await db
      .update(users)
      .set({
        name: validate.data.name,
        role: targetRole,
        oab: validate.data.oab || null,
        phone: validate.data.phone || null,
      })
      .where(eq(users.id, validate.data.id));

    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao atualizar membro." };
  }
}

export async function removeTeamMember(memberId: string) {
  try {
    const sessionUser = await requireUser();
    const sessionUserId = (sessionUser as any).id as string;

    // Busca role REAL do banco
    const [me] = await db.select({ role: users.role }).from(users).where(eq(users.id, sessionUserId)).limit(1);
    if (me?.role !== "admin") {
      return { error: "Apenas administradores podem remover membros." };
    }

    // Proteção: não pode remover a si mesmo
    if (sessionUserId === memberId) {
      return { error: "Você não pode remover a si mesmo do sistema." };
    }

    await db.delete(users).where(eq(users.id, memberId));

    revalidatePath("/equipe");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao remover membro." };
  }
}
