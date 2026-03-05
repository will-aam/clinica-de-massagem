import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * Retorna configurações públicas da clínica (Settings),
 * incluindo nome fantasia e horários de funcionamento.
 *
 * GET /api/settings/public
 */
export async function GET() {
  try {
    const admin = await requireAuth();

    const settings = await prisma.settings.findUnique({
      where: {
        organization_id: admin.organizationId,
      },
      select: {
        company_name: true,
        trade_name: true,
        opening_time: true,
        closing_time: true,
      },
    });

    if (!settings) {
      return NextResponse.json(
        { error: "Configurações não encontradas para essa organização." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      companyName: settings.company_name,
      tradeName: settings.trade_name,
      openingTime: settings.opening_time,
      closingTime: settings.closing_time,
    });
  } catch (error) {
    console.error("[GET /api/settings/public] ERRO:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Erro ao carregar configurações públicas." },
      { status: 500 },
    );
  }
}
