import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Lista todos os templates de pacotes (com filtro opcional de ativos)
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAuth();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("active") === "true";

    const templates = await prisma.packageTemplate.findMany({
      where: {
        organization_id: admin.organizationId,
        ...(onlyActive ? { active: true } : {}),
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // 🔥 Sanitização: Converte Decimal para Number antes de enviar para o cliente
    const sanitizedTemplates = templates.map((t) => ({
      ...t,
      price: Number(t.price),
    }));

    return NextResponse.json(sanitizedTemplates);
  } catch (error) {
    console.error("Erro ao buscar templates:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Cria um novo template de pacote
export async function POST(request: Request) {
  try {
    const admin = await requireAuth();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, total_sessions, price, validity_days } = body;

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

    const template = await prisma.packageTemplate.create({
      data: {
        name,
        description: description || null,
        total_sessions: Number(total_sessions),
        price: Number(price),
        validity_days: validity_days ? Number(validity_days) : null,
        active: true,
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      // 🔥 Também sanitizamos aqui para manter a consistência
      template: {
        ...template,
        price: Number(template.price),
      },
    });
  } catch (error) {
    console.error("Erro ao criar template:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
