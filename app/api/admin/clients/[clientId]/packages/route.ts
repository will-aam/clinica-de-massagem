import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(
  _req: Request,
  { params }: { params: { clientId: string } },
) {
  try {
    const admin = await requireAuth();
    const { clientId } = params;

    if (!clientId) {
      return NextResponse.json(
        { error: "clientId é obrigatório." },
        { status: 400 },
      );
    }

    // Valida se o cliente pertence à organização do admin
    const client = await prisma.client.findFirst({
      where: {
        id: clientId,
        organization_id: admin.organizationId,
      },
      select: { id: true },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado." },
        { status: 404 },
      );
    }

    const packages = await prisma.package.findMany({
      where: {
        client_id: clientId,
        organization_id: admin.organizationId,
        active: true,
      },
      select: {
        id: true,
        name: true,
        total_sessions: true,
        used_sessions: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json({ packages });
  } catch (error) {
    console.error("[GET /api/admin/clients/[clientId]/packages] ERRO:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erro ao listar pacotes do cliente." },
      { status: 500 },
    );
  }
}
