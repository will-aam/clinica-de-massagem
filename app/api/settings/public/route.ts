import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Retorna configurações públicas da clínica (Settings),
 * incluindo nome fantasia e horários de funcionamento.
 *
 * GET /api/settings/public?organizationId=ORG_ID
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

    const settings = await prisma.settings.findUnique({
      where: {
        organization_id: organizationId,
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
    return NextResponse.json(
      { error: "Erro ao carregar configurações públicas." },
      { status: 500 },
    );
  }
}
