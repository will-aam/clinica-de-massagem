import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // 🔥 Se está tentando acessar /admin ou /totem SEM token
    if (!token && (path.startsWith("/admin") || path.startsWith("/totem"))) {
      // Exceto as rotas públicas de admin
      if (
        path === "/admin/login" ||
        path === "/admin/register" ||
        path === "/admin/forgot-password" ||
        path === "/check-email"
      ) {
        return NextResponse.next();
      }

      // Redireciona para login
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // 🔥 ROTAS PÚBLICAS (não precisa de autenticação)
        const publicRoutes = [
          "/",
          "/admin/login",
          "/admin/register",
          "/admin/forgot-password",
          "/check-email",
          "/verify-email",
          "/api/auth",
        ];

        // Se é rota pública, permite
        if (publicRoutes.some((route) => path.startsWith(route))) {
          return true;
        }

        // Para rotas protegidas, exige token
        return !!token;
      },
    },
  },
);

export const config = {
  matcher: [
    // Protege /admin e /totem
    "/admin/:path*",
    "/totem/:path*",
    // Mas exclui arquivos estáticos e API pública
    "/((?!_next/static|_next/image|favicon.ico|api/auth/signin|api/auth/callback).*)",
  ],
};
