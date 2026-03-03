import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Lista todos os templates de pacotes
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const templates = await prisma.packageTemplate.findMany({
      where: {
        organization_id: admin.organizationId,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Cria um novo template de pacote
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      total_sessions,
      price,
      validity_days,
      is_active,
    } = body;

    // Validações
    if (!name || !total_sessions || !price) {
      return NextResponse.json(
        { error: "Nome, quantidade de sessões e preço são obrigatórios" },
        { status: 400 },
      );
    }

    if (Number(total_sessions) < 1) {
      return NextResponse.json(
        { error: "O pacote deve ter pelo menos 1 sessão" },
        { status: 400 },
      );
    }

    if (Number(price) <= 0) {
      return NextResponse.json(
        { error: "O preço deve ser maior que zero" },
        { status: 400 },
      );
    }

    const template = await prisma.packageTemplate.create({
      data: {
        name,
        description: description || null,
        total_sessions: Number(total_sessions),
        price: Number(price),
        validity_days: validity_days ? Number(validity_days) : null,
        is_active: is_active !== undefined ? is_active : true,
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      template,
    });
  } catch (error) {
    console.error("Erro ao criar template:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
