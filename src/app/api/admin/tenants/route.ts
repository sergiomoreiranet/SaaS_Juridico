import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const { tenantId, action } = await req.json();

    if (!tenantId || !action) {
      return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
    }

    if (action === "approve") {
      // Calcula data de fim do trial (+15 dias a partir de hoje)
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 15);

      await db
        .update(tenants)
        .set({ status: "trial", trialEndsAt })
        .where(eq(tenants.id, tenantId));

      return NextResponse.json({ success: true, message: "Escritório aprovado! Trial de 15 dias iniciado." });
    }

    if (action === "block") {
      await db
        .update(tenants)
        .set({ status: "blocked" })
        .where(eq(tenants.id, tenantId));

      return NextResponse.json({ success: true, message: "Escritório bloqueado." });
    }

    if (action === "activate") {
      await db
        .update(tenants)
        .set({ status: "active", trialEndsAt: null })
        .where(eq(tenants.id, tenantId));

      return NextResponse.json({ success: true, message: "Escritório ativado com sucesso." });
    }

    return NextResponse.json({ error: "Ação desconhecida." }, { status: 400 });
  } catch (error) {
    console.error("[API /api/admin/tenants] Erro:", error);
    return NextResponse.json({ error: "Erro interno." }, { status: 500 });
  }
}
