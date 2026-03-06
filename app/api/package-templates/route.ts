import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAuth();
    const { searchParams } = new URL(req.url);
    const onlyActive = searchParams.get("active") === "true";

    const templates = await prisma.packageTemplate.findMany({
      where: {
        organization_id: admin.organizationId,
        ...(onlyActive ? { active: true } : {}),
      },
      select: {
        id: true,
        name: true,
        total_sessions: true,
        price: true,
        service_id: true,
        active: true, // 🔥 Garantindo que o status volte para o front
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json(
      templates.map((t) => ({ ...t, price: Number(t.price) })),
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar templates" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const admin = await requireAuth();
    const body = await request.json();

    // 🔥 Capturamos 'active' ou 'is_active' (para evitar erro se o front mandar diferente)
    const { name, total_sessions, price, service_id, is_active, active } = body;
    const finalActiveStatus =
      active !== undefined
        ? active
        : is_active !== undefined
          ? is_active
          : true;

    if (!name || !total_sessions || !price || !service_id) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 });
    }

    const template = await prisma.packageTemplate.create({
      data: {
        name,
        total_sessions: Number(total_sessions),
        price: Number(price),
        service_id,
        active: finalActiveStatus, // 🔥 Agora salvamos o status correto
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json({ success: true, template });
  } catch (error) {
    console.error("Erro na API POST:", error);
    return NextResponse.json(
      { error: "Erro ao criar template" },
      { status: 500 },
    );
  }
}
