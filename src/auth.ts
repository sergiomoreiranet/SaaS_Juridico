import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "./db";
import { users, tenants } from "./db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const { handlers, signIn, signOut, auth } = NextAuth({
  // Essencial para multi-tenant com subdomínios: confia no header Host completo
  // incluindo a porta (:3000), evitando redirects para http://slug.localhost SEM porta
  trustHost: true,

  // Configura cookie único para evitar fragmentação em 20+ chunks (causa do HTTP 431)
  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false, // false em localhost (sem HTTPS)
      },
    },
  },

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

        // IMPORTANTE: NÃO incluir image aqui — se for base64 causa JWT de 80KB e HTTP 431
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
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 5 * 60, // 5 minutos de Inatividade = Deslogado automaticamente
    updateAge: 60, // Rotaciona o cookie a cada 1 minuto de atividade para manter o usuário logado
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        // Apenas campos essenciais — manter JWT pequeno para evitar fragmentação de cookies
        token.name = user.name;
        token.email = user.email;
        token.tenantId = (user as any).tenantId;
        token.role = (user as any).role;
        token.tenantStatus = (user as any).tenantStatus;
        token.tenantSlug = (user as any).tenantSlug;
        token.isSuperAdmin = user.email === process.env.SUPER_ADMIN_EMAIL;
        token.absoluteExpiry = Date.now() + 15 * 60 * 1000;
      }
      
      if (trigger === "update" && session) {
        if (session.name) token.name = session.name;
        if (session.email) token.email = session.email;
      }

      if (Date.now() > (token.absoluteExpiry as number)) {
        return { error: "RefreshExpired" };
      }

      return token;
    },
    async session({ session, token }) {
      if (token.error === "RefreshExpired") {
        (session as any).expires = new Date(0).toISOString();
        return session;
      }
      if (session.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name;
        if (token.email) session.user.email = token.email as string;
        // image não vem do JWT — usar endpoint próprio para carregar a foto do banco
        session.user.image = "/api/user/avatar";
        (session.user as any).tenantId = token.tenantId as string;
        (session.user as any).role = token.role as string;
        (session.user as any).tenantStatus = token.tenantStatus as string;
        (session.user as any).tenantSlug = token.tenantSlug as string;
        (session.user as any).isSuperAdmin = token.isSuperAdmin as boolean;
      }
      return session;
    },
  },
});
