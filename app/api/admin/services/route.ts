import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * Lista serviços da organização do admin logado.
 *
 * GET /api/admin/services
 *
 * Resposta:
 * {
 *   "services": [
 *     { "id": "srv_1", "name": "Drenagem Linfática" },
 *     { "id": "srv_2", "name": "Massagem Relaxante" }
 *   ]
 * }
 */
export async function GET() {
  try {
    const admin = await requireAuth();

    const services = await prisma.service.findMany({
      where: {
        organization_id: admin.organizationId,
      },
      select: {
        id: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json({ services });
  } catch (error) {
    console.error("[GET /api/admin/services] ERRO:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erro ao listar serviços." },
      { status: 500 },
    );
  }
}
