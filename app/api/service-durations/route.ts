import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Lista todas as durações cadastradas
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const durations = await prisma.serviceDuration.findMany({
      where: {
        organization_id: admin.organizationId,
        is_active: true,
      },
      orderBy: {
        minutes: "asc",
      },
    });

    return NextResponse.json(durations);
  } catch (error) {
    console.error("Erro ao buscar durações:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Cria uma nova duração
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { label, minutes } = body;

    if (!label || !minutes) {
      return NextResponse.json(
        { error: "Label e minutos são obrigatórios" },
        { status: 400 },
      );
    }

    if (Number(minutes) < 1) {
      return NextResponse.json(
        { error: "Duração deve ser maior que zero" },
        { status: 400 },
      );
    }

    // Verifica se já existe
    const existing = await prisma.serviceDuration.findFirst({
      where: {
        minutes: Number(minutes),
        organization_id: admin.organizationId,
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Duração já cadastrada" },
        { status: 409 },
      );
    }

    const duration = await prisma.serviceDuration.create({
      data: {
        label,
        minutes: Number(minutes),
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
      duration,
    });
  } catch (error) {
    console.error("Erro ao criar duração:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// DELETE - Remove uma duração
export async function DELETE(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });
    }

    await prisma.serviceDuration.delete({
      where: {
        id,
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("Erro ao deletar duração:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
