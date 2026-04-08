import type { NextAuthConfig } from "next-auth";

/**
 * Config compartilhada e compatível com Edge (middleware).
 * Não importar db, bcrypt ou outros módulos só-Node aqui.
 */
export default {
  trustHost: true,

  /** Vazio no Edge: login real usa providers em `auth.ts`. */
  providers: [],

  cookies: {
    sessionToken: {
      name: "authjs.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: false,
      },
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 5 * 60,
    updateAge: 60,
  },

  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
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
} satisfies NextAuthConfig;
