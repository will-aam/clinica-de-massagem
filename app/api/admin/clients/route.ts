import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Lista clientes de uma organização.
 *
 * GET /api/admin/clients?organizationId=ORG_ID
 *
 * Resposta:
 * {
 *   "clients": [
 *     { "id": "cl_1", "name": "Maria Silva" },
 *     { "id": "cl_2", "name": "João Souza" }
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

    const clients = await prisma.client.findMany({
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

    return NextResponse.json({ clients });
  } catch (error) {
    console.error("[GET /api/admin/clients] ERRO:", error);
    return NextResponse.json(
      { error: "Erro ao listar clientes." },
      { status: 500 },
    );
  }
}
