import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  const tenantStatus = (req.auth?.user as any)?.tenantStatus;
  const tenantSlug = (req.auth?.user as any)?.tenantSlug;
  const isSuperAdmin = (req.auth?.user as any)?.isSuperAdmin;

  let hostname = req.headers.get("host") || "";
  hostname = hostname.replace(/:\d+$/, "");

  const isLocal = hostname.includes("localhost");
  const baseDomain = isLocal ? "localhost" : "juriadmin.com.br";

  if (nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (isAuthenticated && !isSuperAdmin && (tenantStatus === "pending" || tenantStatus === "blocked")) {
    const url = nextUrl.clone();
    url.pathname = `/status/${tenantStatus}`;
    return NextResponse.rewrite(url);
  }

  const subdomain = hostname.endsWith(`.${baseDomain}`)
    ? hostname.replace(`.${baseDomain}`, "")
    : null;

  if (subdomain && subdomain !== "www") {
    if (nextUrl.pathname.startsWith("/login")) {
      if (isAuthenticated) return NextResponse.redirect(new URL("/", nextUrl));
      return NextResponse.next();
    }

    if (!isAuthenticated) {
      return NextResponse.redirect(new URL("/login", nextUrl));
    }

    const url = nextUrl.clone();
    url.pathname = `/tenant/${subdomain}${nextUrl.pathname}`;
    return NextResponse.rewrite(url);
  }

  const isLoginPage = nextUrl.pathname.startsWith("/login");
  const isRootPage = nextUrl.pathname === "/";
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  if (isAuthenticated && (isRootPage || isLoginPage)) {
    if (isSuperAdmin) {
      return NextResponse.redirect(new URL("/admin", nextUrl));
    } else if (tenantSlug) {
      const url = nextUrl.clone();
      url.hostname = `${tenantSlug}.${baseDomain}`;
      url.pathname = "/";
      return NextResponse.redirect(url);
    }
  }

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
