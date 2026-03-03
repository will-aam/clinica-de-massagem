import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Lista todos os serviços da organização
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const services = await prisma.service.findMany({
      where: {
        organization_id: admin.organizationId,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("Erro ao buscar serviços:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Cria um novo serviço
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, duration, price, category_id } = body;

    // Validações
    if (!name || !duration || !price) {
      return NextResponse.json(
        { error: "Nome, duração e preço são obrigatórios" },
        { status: 400 },
      );
    }

    // Se não tiver categoria, cria uma padrão
    let finalCategoryId = category_id;

    if (!finalCategoryId) {
      // Busca ou cria categoria "Geral"
      let defaultCategory = await prisma.category.findFirst({
        where: {
          name: "Geral",
          organization_id: admin.organizationId,
        },
      });

      if (!defaultCategory) {
        defaultCategory = await prisma.category.create({
          data: {
            name: "Geral",
            organization_id: admin.organizationId,
          },
        });
      }

      finalCategoryId = defaultCategory.id;
    }

    const service = await prisma.service.create({
      data: {
        name,
        description: description || null,
        duration: Number(duration),
        price: Number(price),
        category_id: finalCategoryId,
        organization_id: admin.organizationId,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      service,
    });
  } catch (error) {
    console.error("Erro ao criar serviço:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
