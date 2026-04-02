import { NextResponse, NextRequest } from "next/server";
import fs from "fs/promises";
import path from "path";

type Context = { params: Promise<{ filename: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  try {
    const { filename } = await params;
    // Evitar transversia de diretório
    if (!filename || filename.includes("..") || filename.includes("/")) {
      return new NextResponse("Invalid filename", { status: 400 });
    }

    const filepath = path.join(process.cwd(), "public", "uploads", "avatars", filename);
    const buffer = await fs.readFile(filepath);

    // Determinar o Content-Type
    const ext = filename.split(".").pop();
    const contentType = ext === "png" ? "image/png" 
                      : ext === "gif" ? "image/gif" 
                      : ext === "webp" ? "image/webp" 
                      : "image/jpeg";

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    return new NextResponse("Not Found", { status: 404 });
  }
}
