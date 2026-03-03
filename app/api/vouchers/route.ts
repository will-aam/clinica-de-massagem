import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Lista pacotes concluídos (prontos para gerar voucher)
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca pacotes onde todas as sessões foram usadas
    const completedPackages = await prisma.package.findMany({
      where: {
        organization_id: admin.organizationId,
        active: true,
        used_sessions: {
          gte: prisma.package.fields.total_sessions, // Sessões usadas >= total
        },
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
          },
        },
        service: {
          select: {
            name: true,
          },
        },
        vouchers: {
          orderBy: {
            issue_date: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updated_at: "desc",
      },
    });

    // Formata os dados para o frontend
    const formatted = completedPackages.map((pkg) => ({
      id: pkg.id,
      clientId: pkg.client.id,
      clientName: pkg.client.name,
      packageName: pkg.name,
      serviceName: pkg.service.name,
      totalSessions: pkg.total_sessions,
      completionDate: pkg.updated_at.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      hasVoucher: pkg.vouchers.length > 0,
      lastVoucherDate: pkg.vouchers[0]?.issue_date,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error("Erro ao buscar vouchers:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// POST - Registra que um voucher foi emitido
export async function POST(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { package_id, image_url } = body;

    if (!package_id) {
      return NextResponse.json(
        { error: "ID do pacote é obrigatório" },
        { status: 400 },
      );
    }

    // Cria o registro de voucher
    const voucher = await prisma.voucher.create({
      data: {
        package_id,
        image_url: image_url || null,
      },
    });

    return NextResponse.json({
      success: true,
      voucher,
    });
  } catch (error) {
    console.error("Erro ao registrar voucher:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
