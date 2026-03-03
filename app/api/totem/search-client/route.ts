import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Busca cliente pelo CPF (sem autenticação - acesso público do totem)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");
    const org_slug = searchParams.get("org");

    if (!cpf || !org_slug) {
      return NextResponse.json(
        { error: "CPF e organização são obrigatórios" },
        { status: 400 },
      );
    }

    // Remove pontuação do CPF
    const cleanCpf = cpf.replace(/\D/g, "");

    // Busca a organização pelo slug
    const organization = await prisma.organization.findUnique({
      where: { slug: org_slug },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 },
      );
    }

    // Busca o cliente
    const client = await prisma.client.findFirst({
      where: {
        cpf: cleanCpf,
        organization_id: organization.id,
      },
      include: {
        packages: {
          where: {
            active: true,
            used_sessions: {
              lt: prisma.package.fields.total_sessions, // Ainda tem sessões disponíveis
            },
          },
          include: {
            service: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!client) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }

    // Formata resposta
    const response = {
      id: client.id,
      name: client.name,
      phone: client.phone_whatsapp,
      packages: client.packages.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        serviceName: pkg.service.name,
        totalSessions: pkg.total_sessions,
        usedSessions: pkg.used_sessions,
        remainingSessions: pkg.total_sessions - pkg.used_sessions,
        price: pkg.price,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro ao buscar cliente:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
