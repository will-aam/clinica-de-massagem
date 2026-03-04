import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Lista serviços de uma organização.
 *
 * GET /api/admin/services?organizationId=ORG_ID
 *
 * Resposta:
 * {
 *   "services": [
 *     { "id": "srv_1", "name": "Drenagem Linfática" },
 *     { "id": "srv_2", "name": "Massagem Relaxante" }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId é obrigatório." },
        { status: 400 },
      );
    }

    const services = await prisma.service.findMany({
      where: {
        organization_id: organizationId,
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
    return NextResponse.json(
      { error: "Erro ao listar serviços." },
      { status: 500 },
    );
  }
}
