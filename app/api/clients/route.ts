import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Lista todos os clientes ativos da organização
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const clients = await prisma.client.findMany({
      where: {
        organization_id: admin.organizationId,
        active: true, // 🔥 Garante que só vamos listar clientes ativos
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        cpf: true,
        phone_whatsapp: true,
        email: true,
        birth_date: true,
        created_at: true,
        packages: {
          where: { active: true },
          select: {
            id: true,
            name: true,
            used_sessions: true,
            total_sessions: true,
          },
        },
        // 🔥 Conta as relações para sabermos se o cliente tem histórico
        _count: {
          select: {
            appointments: true,
            check_ins: true,
            packages: true,
          },
        },
      },
    });

    const formattedClients = clients.map((client) => {
      const activePkg = client.packages.find(
        (pkg) => pkg.used_sessions < pkg.total_sessions,
      );

      // 🔥 Lógica Inteligente: Se tem agendamento, check-in ou pacote = tem histórico!
      const hasHistory =
        client._count.appointments > 0 ||
        client._count.check_ins > 0 ||
        client._count.packages > 0;

      return {
        id: client.id,
        name: client.name,
        cpf: client.cpf,
        phone_whatsapp: client.phone_whatsapp,
        email: client.email,
        birth_date: client.birth_date,
        created_at: client.created_at,
        activePackageName: activePkg ? activePkg.name : null,
        hasHistory, // 🔥 Passamos esta info para o Frontend decidir qual botão mostrar
      };
    });

    return NextResponse.json(formattedClients);
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Cria um novo cliente
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      cpf,
      phone_whatsapp,
      email,
      birth_date,
      zip_code,
      city,
      street,
      number,
    } = body;

    if (!name || !cpf || !phone_whatsapp) {
      return NextResponse.json(
        { error: "Nome, CPF e WhatsApp são obrigatórios" },
        { status: 400 },
      );
    }

    const existingClient = await prisma.client.findUnique({
      where: {
        cpf_organization_id: {
          cpf: cpf,
          organization_id: admin.organizationId,
        },
      },
    });

    if (existingClient) {
      // Se ele existir mas estiver inativo, não deixamos criar de novo para evitar conflito.
      return NextResponse.json(
        { error: "Este CPF já está cadastrado na organização" },
        { status: 409 },
      );
    }

    const client = await prisma.client.create({
      data: {
        name,
        cpf,
        phone_whatsapp,
        email: email || null,
        birth_date: birth_date ? new Date(birth_date) : null,
        zip_code: zip_code || null,
        city: city || null,
        street: street || null,
        number: number || null,
        organization_id: admin.organizationId,
        active: true, // 🔥 Garante que nasce ativo
      },
    });

    return NextResponse.json({
      success: true,
      client: {
        id: client.id,
        name: client.name,
        cpf: client.cpf,
      },
    });
  } catch (error) {
    console.error("Erro ao criar cliente:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
