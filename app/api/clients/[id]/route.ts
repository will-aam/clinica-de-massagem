import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";
import type { Client, Package, CheckIn } from "@prisma/client";

// Tipos auxiliares
type ClientWithRelations = Client & {
  packages: Package[];
  check_ins: CheckIn[];
};

// GET - Busca detalhes de um cliente específico
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const client = (await prisma.client.findFirst({
      where: {
        id: id,
        organization_id: admin.organizationId,
      },
      include: {
        packages: {
          orderBy: {
            created_at: "desc",
          },
        },
        check_ins: {
          orderBy: {
            date_time: "desc", // 🔥 CORRIGIDO: campo correto é date_time
          },
          take: 10,
        },
      },
    })) as ClientWithRelations | null;

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // Busca o pacote ativo
    const activePackage = client.packages.find(
      (pkg: Package) => pkg.used_sessions < pkg.total_sessions,
    );

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        cpf: client.cpf,
        phone_whatsapp: client.phone_whatsapp,
        email: client.email,
        birth_date: client.birth_date,
        zip_code: client.zip_code,
        city: client.city,
        street: client.street,
        number: client.number,
        created_at: client.created_at,
      },
      packages: client.packages,
      checkIns: client.check_ins,
      activePackage: activePackage || null,
    });
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// DELETE - Deleta um cliente
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const client = await prisma.client.findFirst({
      where: {
        id: id,
        organization_id: admin.organizationId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    await prisma.client.delete({
      where: { id: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar cliente:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Adiciona um novo pacote ao cliente
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { total_sessions, service_id, price } = await request.json();

    if (!total_sessions) {
      return NextResponse.json(
        { error: "Total de sessões é obrigatório" },
        { status: 400 },
      );
    }

    const client = await prisma.client.findFirst({
      where: {
        id: id,
        organization_id: admin.organizationId,
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    const pkg = await prisma.package.create({
      data: {
        name: `Pacote de ${total_sessions} sessões`,
        total_sessions: Number(total_sessions),
        used_sessions: 0,
        price: price || 0,
        client_id: id,
        service_id: service_id || null,
        organization_id: admin.organizationId,
      },
    });

    return NextResponse.json(pkg, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar pacote:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
