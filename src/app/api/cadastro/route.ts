import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants, users } from "@/db/schema";
import { hash } from "bcryptjs";

// Converte nome do escritório para slug de subdomínio
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nome, escritorio, oab, email, telefone, senha, plano } = body;

    // Validação básica dos campos obrigatórios
    if (!nome || !escritorio || !email || !senha) {
      return NextResponse.json(
        { error: "Campos obrigatórios não preenchidos." },
        { status: 400 }
      );
    }

    if (senha.length < 8) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 8 caracteres." },
        { status: 400 }
      );
    }

    const slug = generateSlug(escritorio);

    // Verificar se o slug já está em uso
    const existingTenant = await db.query.tenants.findFirst({
      where: (t, { eq }) => eq(t.slug, slug),
    });

    if (existingTenant) {
      return NextResponse.json(
        { error: `O subdomínio "${slug}.juriadm.com.br" já está em uso. Tente um nome diferente.` },
        { status: 409 }
      );
    }

    // Verificar se o email já está cadastrado
    const existingUser = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email),
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este e-mail já está cadastrado no sistema." },
        { status: 409 }
      );
    }

    // Hash da senha com bcrypt (12 rounds para segurança)
    const hashedPassword = await hash(senha, 12);

    // Criar o tenant (escritório) com status "pending" — aguarda aprovação do Admin
    const [newTenant] = await db
      .insert(tenants)
      .values({
        name: escritorio,
        slug,
        plan: plano || "basico",
        status: "pending",
      })
      .returning();

    // Criar o usuário admin do escritório vinculado ao tenant
    await db.insert(users).values({
      tenantId: newTenant.id,
      email,
      password: hashedPassword,
      name: nome,
      oab: oab || null,
      phone: telefone || null,
      role: "admin", // Primeiro usuário é sempre o admin do escritório
    });

    return NextResponse.json(
      {
        success: true,
        message: "Solicitação enviada com sucesso! Aguarde a aprovação em até 24h.",
        slug,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API /cadastro] Erro:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar o cadastro. Tente novamente." },
      { status: 500 }
    );
  }
}
