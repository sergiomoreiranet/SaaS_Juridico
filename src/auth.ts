import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "./auth.config";
import { db } from "./db";
import { users, tenants } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Preencha email e senha.");
        }

        const result = await db
          .select({
            user: users,
            tenantStatus: tenants.status,
            tenantSlug: tenants.slug,
          })
          .from(users)
          .leftJoin(tenants, eq(users.tenantId, tenants.id))
          .where(eq(users.email, credentials.email as string))
          .limit(1);

        const row = result[0];
        const user = row?.user;
        const tenantStatus = row?.tenantStatus;
        const tenantSlug = row?.tenantSlug;

        if (!user || !user.password) {
          throw new Error("Usuário não encontrado.");
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password);

        if (!isValid) {
          throw new Error("Senha inválida.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          tenantId: user.tenantId,
          role: user.role,
          tenantStatus: tenantStatus,
          tenantSlug: tenantSlug,
        };
      },
    }),
  ],
});
