"use server";

import { db } from "@/db";
import { clients } from "@/db/schema";
import { requireUser } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";

const createClientSchema = z.object({
  name: z.string().min(3, "O nome deve ter no mínimo 3 caracteres."),
  personType: z.string().optional(),
  cpfCnpj: z.string().optional(),
  rgIe: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  profession: z.string().optional(),
  nationality: z.string().optional(),
  oab: z.string().optional(),
  indication: z.string().optional(),
  observations: z.string().optional(),
  email: z.string().email("E-mail inválido.").or(z.literal("")).optional(),
  phone: z.string().optional(),
  phones: z.any().optional(), // Array de {type, number}
  cep: z.string().optional(),
  streetType: z.string().optional(),
  street: z.string().optional(),
  number: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
});

export async function createClient(data: z.infer<typeof createClientSchema>) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;
    if (!tenantId) {
      throw new Error("Usuário não está associado a nenhum escritório.");
    }

    const validate = createClientSchema.safeParse(data);
    if (!validate.success) {
      return { error: validate.error.issues[0].message };
    }

    const valData = validate.data;

    await db.insert(clients).values({
      tenantId,
      name: valData.name,
      personType: valData.personType || "PF",
      cpfCnpj: valData.cpfCnpj || null,
      rgIe: valData.rgIe || null,
      birthDate: valData.birthDate || null,
      gender: valData.gender || null,
      maritalStatus: valData.maritalStatus || null,
      profession: valData.profession || null,
      nationality: valData.nationality || null,
      oab: valData.oab || null,
      indication: valData.indication || null,
      observations: valData.observations || null,
      email: valData.email || null,
      phone: valData.phone || null,
      phones: valData.phones || null,
      cep: valData.cep || null,
      streetType: valData.streetType || null,
      street: valData.street || null,
      number: valData.number || null,
      complement: valData.complement || null,
      neighborhood: valData.neighborhood || null,
      city: valData.city || null,
      state: valData.state || null,
    });

    revalidatePath("/clientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao criar cliente." };
  }
}

export async function updateClient(id: string, data: z.infer<typeof createClientSchema>) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;
    if (!tenantId) {
      throw new Error("Usuário não está associado a nenhum escritório.");
    }

    const validate = createClientSchema.safeParse(data);
    if (!validate.success) {
      return { error: validate.error.issues[0].message };
    }

    const valData = validate.data;

    // Verify ownership
    const existing = await db.query.clients.findFirst({
      where: (clients, { eq, and }) => and(eq(clients.id, id), eq(clients.tenantId, tenantId))
    });

    if (!existing) {
      return { error: "Cliente não encontrado ou você não tem permissão." };
    }

    await db.update(clients).set({
      name: valData.name,
      personType: valData.personType || "PF",
      cpfCnpj: valData.cpfCnpj || null,
      rgIe: valData.rgIe || null,
      birthDate: valData.birthDate || null,
      gender: valData.gender || null,
      maritalStatus: valData.maritalStatus || null,
      profession: valData.profession || null,
      nationality: valData.nationality || null,
      oab: valData.oab || null,
      indication: valData.indication || null,
      observations: valData.observations || null,
      email: valData.email || null,
      phone: valData.phone || null,
      phones: valData.phones || null,
      cep: valData.cep || null,
      streetType: valData.streetType || null,
      street: valData.street || null,
      number: valData.number || null,
      complement: valData.complement || null,
      neighborhood: valData.neighborhood || null,
      city: valData.city || null,
      state: valData.state || null,
    }).where(eq(clients.id, id));

    revalidatePath("/clientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao atualizar cliente." };
  }
}

export async function toggleClientStatus(id: string, isActive: boolean) {
  try {
    const user = await requireUser();
    const tenantId = (user as any).tenantId;
    if (!tenantId) {
      throw new Error("Usuário não está associado a nenhum escritório.");
    }

    const existing = await db.query.clients.findFirst({
      where: (clients, { eq, and }) => and(eq(clients.id, id), eq(clients.tenantId, tenantId))
    });

    if (!existing) {
      return { error: "Cliente não encontrado ou você não tem permissão." };
    }

    await db.update(clients)
      .set({ isActive })
      .where(eq(clients.id, id));

    revalidatePath("/clientes");
    return { success: true };
  } catch (error: any) {
    return { error: error.message || "Erro ao alterar status do cliente." };
  }
}
