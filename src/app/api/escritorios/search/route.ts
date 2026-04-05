import { NextResponse } from "next/server";
import { db } from "@/db";
import { tenants } from "@/db/schema";
import { ilike, or, eq, and, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await db
      .select({
        id:   tenants.id,
        name: tenants.name,
        slug: tenants.slug,
        plan: tenants.plan,
      })
      .from(tenants)
      .where(
        and(
          or(
            ilike(tenants.name, `%${q}%`),
            ilike(tenants.slug, `%${q}%`)
          ),
          // Não exibe o tenant "sistema" reservado do Super Admin
          ne(tenants.slug, "sistema"),
          // Só exibe escritórios em trial ou ativos (não pending/blocked)
          or(
            eq(tenants.status, "trial"),
            eq(tenants.status, "active")
          )
        )
      )
      .limit(6);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[API /api/escritorios/search]", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
