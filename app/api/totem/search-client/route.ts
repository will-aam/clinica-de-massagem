// app/api/totem/search-client/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Busca cliente pelo CPF + organização
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cpf = searchParams.get("cpf");
    const slug = searchParams.get("slug");

    if (!cpf || !slug) {
      return NextResponse.json(
        { error: "CPF e slug são obrigatórios" },
        { status: 400 },
      );
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    const organization = await prisma.organization.findUnique({
      where: { slug },
    });

    if (!organization) {
      return NextResponse.json(
        { error: "Organização não encontrada" },
        { status: 404 },
      );
    }

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
              lt: prisma.package.fields.total_sessions,
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
