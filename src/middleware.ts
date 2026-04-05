import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  // ✅ FIX #1: Propriedades do usuário estão em req.auth.user (retorno do callback session),
  //            NÃO diretamente em req.auth. O erro anterior causava isSuperAdmin = undefined SEMPRE.
  const tenantStatus = (req.auth?.user as any)?.tenantStatus;
  const tenantSlug   = (req.auth?.user as any)?.tenantSlug;
  const isSuperAdmin = (req.auth?.user as any)?.isSuperAdmin;

  // --- Lógica de Subdomínios Multi-tenant ---
  let hostname = req.headers.get("host") || "";
  hostname = hostname.replace(/:\d+$/, ""); // Remove a porta

  const isLocal = hostname.includes("localhost");
  const baseDomain = isLocal ? "localhost" : "juriadmin.com.br";

  // Permite que todas as rotas da API passem direto sem reescrita de subdomínio
  // Inclui /api/escritorios (busca pública de escritórios para a landing page)
  if (nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --- Lógica de Bloqueio por Status do Tenant ---
  if (isAuthenticated && !isSuperAdmin && (tenantStatus === "pending" || tenantStatus === "blocked")) {
    const url = nextUrl.clone();
    url.pathname = `/status/${tenantStatus}`;
    return NextResponse.rewrite(url);
  }

  const subdomain = hostname.endsWith(`.${baseDomain}`)
    ? hostname.replace(`.${baseDomain}`, "")
    : null;

  // ✅ FIX #2: Subdomínio "admin" REMOVIDO. O painel admin agora fica em
  //            localhost:3000/admin (mesma origem). Isso elimina:
  //            - Perda da porta :3000 no redirect
  //            - Problema de cookie cross-domain (cookie de localhost não vai para admin.localhost)

  // Subdomínio de escritório (ex: suelipinheiro.localhost:3000)
  if (subdomain && subdomain !== "www") {
    // Ignora rotas globais obrigatórias de Auth no subdomínio
    if (nextUrl.pathname.startsWith("/login")) {
      if (isAuthenticated) return NextResponse.redirect(new URL("/", nextUrl));
      return NextResponse.next();
    }

    // GUARD: Se não está autenticado, redireciona para /login do próprio subdomínio
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    const url = nextUrl.clone();
    url.pathname = `/tenant/${subdomain}${nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Domínio principal sem subdomínio (localhost:3000 / juriadmin.com.br) ---
  const isLoginPage  = nextUrl.pathname.startsWith("/login");
  const isRootPage   = nextUrl.pathname === "/";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Usuário autenticado tentando acessar / ou /login no domínio principal
  if (isAuthenticated && (isRootPage || isLoginPage)) {
    if (isSuperAdmin) {
      // ✅ Super Admin → /admin na MESMA origem. Sem troca de hostname, sem perda de porta.
      return NextResponse.redirect(new URL("/admin", nextUrl));
    } else if (tenantSlug) {
      // Advogado logado no domínio principal → redireciona para o subdomínio do escritório
      const url = nextUrl.clone();
      url.hostname = `${tenantSlug}.${baseDomain}`;
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

  // ✅ FIX #3: Proteção explícita das rotas /admin — somente Super Admin tem acesso
  if (isAdminRoute) {
    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }
    if (!isSuperAdmin) {
      return NextResponse.redirect(new URL("/403", nextUrl));
    }
    return NextResponse.next();
  }

  const isPublicRoute =
    isRootPage ||
    nextUrl.pathname.startsWith("/cadastro") ||
    nextUrl.pathname.startsWith("/api/cadastro") ||
    nextUrl.pathname.startsWith("/api/auth") ||
    nextUrl.pathname.startsWith("/ui-kit");

  if (isPublicRoute) return NextResponse.next();

  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
