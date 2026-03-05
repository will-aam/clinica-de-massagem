import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAuth();

    // Busca check-ins sem appointment vinculado (check-ins avulsos)
    const pendingCheckIns = await prisma.checkIn.findMany({
      where: {
        organization_id: admin.organizationId,
        appointment_id: null,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    const mapped = pendingCheckIns.map((checkIn) => ({
      id: checkIn.id,
      clientId: checkIn.client?.id ?? null,
      clientName: checkIn.client?.name ?? "Cliente desconhecido",
      dateTime: checkIn.date_time,
    }));

    return NextResponse.json({ pendingCheckIns: mapped });
  } catch (error) {
    console.error("[GET /api/admin/checkins/pending] ERRO:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erro ao listar check-ins pendentes." },
      { status: 500 },
    );
  }
}
