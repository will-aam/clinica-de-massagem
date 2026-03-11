// app/api/settings/public/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

/**
 * Retorna configurações públicas da clínica (Settings).
 * Suporta busca via Sessão (Admin) ou via Slug (Totem/Público).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const slug = searchParams.get("slug");

    // 1) Tenta pegar o ID da organização pela sessão do NextAuth
    const session = await getServerSession(authOptions);
    let organizationId = session?.user?.organizationId;

    // 2) Se não houver sessão, tentamos descobrir o ID através do Slug
    if (!organizationId && slug) {
      const org = await prisma.organization.findUnique({
        where: { slug },
        select: { id: true },
      });
      organizationId = org?.id;
    }

    // 3) FLEXIBILIDADE: Se não tem sessão nem slug válido, não damos erro 400.
    // Apenas retornamos 200 vazio para não quebrar o carregamento do frontend.
    if (!organizationId) {
      return NextResponse.json(
        { message: "Identificação da clínica pendente..." },
        { status: 200 },
      );
    }

    // 4) Busca as configurações no banco
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
        { error: "Configurações não encontradas." },
        { status: 404 },
      );
    }

    // Retorna os dados mapeados para o frontend
    return NextResponse.json({
      companyName: settings.company_name,
      tradeName: settings.trade_name,
      openingTime: settings.opening_time,
      closingTime: settings.closing_time,
    });
  } catch (error) {
    console.error("[GET /api/settings/public] ERRO:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor." },
      { status: 500 },
    );
  }
}
