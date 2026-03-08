import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca todos os check-ins da organização atual, ordenados pelos mais recentes
    const checkIns = await prisma.checkIn.findMany({
      where: {
        organization_id: admin.organizationId,
      },
      include: {
        client: {
          select: {
            name: true,
            cpf: true,
          },
        },
      },
      orderBy: {
        date_time: "desc",
      },
    });

    // Mapeia para o formato exato (EnrichedCheckIn) que a sua tabela já espera
    const enriched = checkIns.map((ci) => ({
      id: ci.id,
      client_id: ci.client_id || "",
      package_id: ci.package_id || "",
      date_time: ci.date_time.toISOString(),
      client_name: ci.client?.name || "Cliente Excluído/Avulso",
      client_cpf: ci.client?.cpf || "---",
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    console.error("Erro ao buscar histórico:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
