import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;
  const tenantStatus = (req.auth as any)?.tenantStatus;
  const isSuperAdmin = (req.auth as any)?.isSuperAdmin;

  // --- Lógica de Subdomínios Multi-tenant ---
  let hostname = req.headers.get("host") || "";
  hostname = hostname.replace(/:\d+$/, ""); // Remove a porta

  const isLocal = hostname.includes("localhost");
  const baseDomain = isLocal ? "localhost" : "juriadmin.com.br";

  // Permite que todas as rotas da API passem direto sem reescrita de subdomínio
  if (nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // --- Lógica de Bloqueio por Status do Tenant ---
  if (isAuthenticated && !isSuperAdmin && (tenantStatus === "pending" || tenantStatus === "blocked")) {
    const url = nextUrl.clone();
    url.pathname = `/status/${tenantStatus}`;
    return NextResponse.rewrite(url); // Ignora logs e joga para a página de status global
  }

  const subdomain = hostname.endsWith(`.${baseDomain}`)
    ? hostname.replace(`.${baseDomain}`, "")
    : null;

  // Se for o painel Super Admin (admin.localhost / admin.juriadmin.com.br)
  if (subdomain === "admin") {
    const url = nextUrl.clone();
    url.pathname = `/admin${nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // Se for um subdomínio de escritório (slug.localhost / slug.juriadmin.com.br)
  if (subdomain && subdomain !== "www") {
    // Ignora rotas globais obrigatórias de Auth no subdomínio
    if (nextUrl.pathname.startsWith("/login")) {
      if (isAuthenticated) return NextResponse.redirect(new URL("/", nextUrl));
      return NextResponse.next();
    }

    // ✔ GUARD: Se não está autenticado, redireciona para /login do próprio subdomínio
    if (!isAuthenticated) {
      const loginUrl = new URL("/login", nextUrl);
      return NextResponse.redirect(loginUrl);
    }

    const url = nextUrl.clone();
    url.pathname = `/tenant/${subdomain}${nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  // --- Lógica de Auth (rota principal juriadmin.com.br / localhost) ---
  const isLoginPage = nextUrl.pathname.startsWith("/login");
  const isPublicRoute =
    nextUrl.pathname === "/" ||
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
