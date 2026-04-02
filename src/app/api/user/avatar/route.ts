import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const [user] = await db
    .select({ image: users.image })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user?.image) {
    return new NextResponse("No avatar", { status: 404 });
  }

  // Suporte a base64 data URI (ex: "data:image/jpeg;base64,...")
  if (user.image.startsWith("data:")) {
    const [header, base64Data] = user.image.split(",");
    const mimeMatch = header.match(/data:([^;]+);base64/);
    const mimeType = mimeMatch?.[1] ?? "image/jpeg";
    const buffer = Buffer.from(base64Data, "base64");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": mimeType,
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  }

  // Suporte a URLs normais — apenas redireciona
  return NextResponse.redirect(user.image);
}
