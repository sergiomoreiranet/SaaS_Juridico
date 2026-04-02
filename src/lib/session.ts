import { auth } from "@/auth";

/**
 * Função global atalho para Server Components e API Routes sensíveis.
 * Dispara automaticamente um erro se o Auth não for encontrado antes de
 * deixá-los efetuar queries no banco.
 */
export async function requireUser() {
  const session = await auth();
  
  if (!session?.user) {
    throw new Error("UNAUTHORIZED HTTP 401");
  }

  return session.user;
}
