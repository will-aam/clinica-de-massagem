import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin } from "@/lib/auth";

// GET - Busca templates de mensagem e WhatsApp
export async function GET() {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Busca configurações (para pegar o WhatsApp)
    const settings = await prisma.settings.findUnique({
      where: { organization_id: admin.organizationId },
    });

    // Busca templates de mensagem
    const templates = await prisma.messageTemplate.findMany({
      where: { organization_id: admin.organizationId },
    });

    // Converte array de templates em objeto
    const templatesMap: Record<string, string> = {};
    templates.forEach((t) => {
      templatesMap[t.type] = t.content;
    });

    return NextResponse.json({
      phone: settings?.phone_whatsapp || "",
      msgUpdate: templatesMap["CHECK_IN"] || "",
      msgWelcome: templatesMap["WELCOME"] || "",
      msgRenewal: templatesMap["RENEWAL"] || "",
      msgReminder: templatesMap["REMINDER"] || "",
    });
  } catch (error) {
    console.error("Erro ao buscar mensagens:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}

// PUT - Atualiza templates e WhatsApp
export async function PUT(request: Request) {
  try {
    const admin = await getCurrentAdmin();

    if (!admin) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const { phone, msgUpdate, msgWelcome, msgRenewal, msgReminder } = body;

    await prisma.$transaction(async (tx) => {
      // 1. Atualiza o número de WhatsApp no Settings
      await tx.settings.update({
        where: { organization_id: admin.organizationId },
        data: { phone_whatsapp: phone },
      });

      // 2. Atualiza ou cria cada template
      const templates = [
        { type: "CHECK_IN", content: msgUpdate },
        { type: "WELCOME", content: msgWelcome },
        { type: "RENEWAL", content: msgRenewal },
        { type: "REMINDER", content: msgReminder },
      ];

      for (const template of templates) {
        await tx.messageTemplate.upsert({
          where: {
            type_organization_id: {
              type: template.type,
              organization_id: admin.organizationId,
            },
          },
          update: {
            content: template.content,
          },
          create: {
            type: template.type,
            content: template.content,
            organization_id: admin.organizationId,
          },
        });
      }
    });

    return NextResponse.json({
      success: true,
      message: "Mensagens atualizadas com sucesso",
    });
  } catch (error) {
    console.error("Erro ao atualizar mensagens:", error);
    return NextResponse.json({ error: "Erro no servidor" }, { status: 500 });
  }
}
