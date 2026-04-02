"use server";

import { requireUser } from "@/lib/session";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function uploadUserAvatar(formData: FormData) {
  try {
    const authUser = await requireUser();
    if (!authUser || !authUser.id) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const file = formData.get("avatar") as File | null;
    if (!file) {
      return { success: false, error: "Nenhum arquivo enviado." };
    }

    // Leitura dos bytes do File
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name || "avatar.jpg";
    const extension = originalName.split(".").pop() || "jpg";
    
    // Determinar o MIME type correto para o Data URI
    let mimeType = "image/jpeg";
    if (extension.toLowerCase() === "png") mimeType = "image/png";
    if (extension.toLowerCase() === "gif") mimeType = "image/gif";
    if (extension.toLowerCase() === "webp") mimeType = "image/webp";

    // Criar uma Base64 Data URI
    const base64String = buffer.toString("base64");
    const publicUrl = `data:${mimeType};base64,${base64String}`;

    // Atualiza diretamente no banco como Base64 (Bypass definitivo de Cache/Turbopack)
    await db
      .update(users)
      .set({ image: publicUrl })
      .where(eq(users.id, authUser.id));

    // Revalidação agressiva para espalhar para o Topbar e Dashboard
    revalidatePath("/", "layout");

    return { success: true, url: publicUrl };
  } catch (error) {
    console.error("Upload Avatar Error:", error);
    return { success: false, error: "Erro interno no servidor." };
  }
}

import bcrypt from "bcryptjs";

export async function updateUserProfileInfo(formData: FormData) {
  try {
    const authUser = await requireUser();
    if (!authUser || !authUser.id) {
      return { success: false, error: "Usuário não autenticado." };
    }

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!name || !email) {
      return { success: false, error: "Nome e e-mail são obrigatórios." };
    }

    // Verifica se o e-mail já existe de outro usuário
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0 && existingUser[0].id !== authUser.id) {
      return { success: false, error: "Este e-mail já está em uso por outra conta." };
    }

    const updateData: any = {
      name,
      email,
    };

    if (password) {
      if (password !== confirmPassword) {
        return { success: false, error: "As senhas não coincidem." };
      }
      if (password.length < 6) {
        return { success: false, error: "A senha deve ter pelo menos 6 caracteres." };
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    await db.update(users).set(updateData).where(eq(users.id, authUser.id));

    // Revalida a sessão/layout para propagar o novo nome e e-mail
    revalidatePath("/", "layout");

    return { success: true };
  } catch (error) {
    console.error("Update Profile Info Error:", error);
    return { success: false, error: "Ocorreu um erro ao atualizar os dados." };
  }
}
