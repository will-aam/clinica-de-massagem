import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Se não há token e está tentando acessar rotas protegidas
    if (!token && (path.startsWith("/admin") || path.startsWith("/totem"))) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    // Se tem token, permite continuar
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const path = req.nextUrl.pathname;

        // Permite acesso público à página de login/registro
        if (path === "/admin/login" || path === "/admin/register") {
          return true;
        }

        // Para rotas protegidas, exige token
        if (path.startsWith("/admin") || path.startsWith("/totem")) {
          return !!token;
        }

        // Outras rotas são públicas
        return true;
      },
    },
  },
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/totem/:path*",
    // Exclui arquivos estáticos e API pública
    "/((?!api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
};
