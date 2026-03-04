// app/api/admin/agenda/day/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

/**
 * TODO FUTURO:
 * Em vez de pegar o organizationId pela query string,
 * podemos pegar pela sessão do admin logado (NextAuth),
 * ou pelo contexto da organização selecionada.
 */
async function getOrganizationIdFromRequest(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const organizationId = searchParams.get("organizationId");
  if (!organizationId) return null;
  return organizationId;
}

/**
 * Lista agendamentos de um dia específico para a organização.
 *
 * GET /api/admin/agenda/day?date=2026-03-04&organizationId=ORG_ID
 *
 * Resposta:
 * {
 *   "appointments": [
 *     {
 *       "id": "...",
 *       "time": "14:00",
 *       "duration": 60,
 *       "clientName": "Maria",
 *       "service": "Drenagem",
 *       "sessionInfo": "Sessão 1 de 10" | "Avulsa",
 *       "isRecurring": true | false,
 *       "phone": "5579999...",
 *       "color": "bg-emerald-100 border-emerald-300 text-emerald-900",
 *       "hasCharge": true | false
 *     }
 *   ]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get("date");

    const organizationId = await getOrganizationIdFromRequest(req);
    if (!organizationId) {
      return NextResponse.json(
        { error: "organizationId obrigatório na query string." },
        { status: 400 },
      );
    }

    if (!dateParam) {
      return NextResponse.json(
        { error: "Parâmetro date é obrigatório (YYYY-MM-DD)." },
        { status: 400 },
      );
    }

    // Converte YYYY-MM-DD para Date
    const [year, month, day] = dateParam.split("-").map(Number);
    const target = new Date(year, month - 1, day);

    const from = startOfDay(target);
    const to = endOfDay(target);

    const appointments = await prisma.appointment.findMany({
      where: {
        organization_id: organizationId,
        date_time: {
          gte: from,
          lte: to,
        },
        status: {
          in: ["PENDENTE", "CONFIRMADO", "REALIZADO"],
        },
      },
      include: {
        client: true,
        service: true,
        package: true,
      },
      orderBy: {
        date_time: "asc",
      },
    });

    // Mapeia Appointment (Prisma) -> Appointment (DailyAgendaGrid)
    const mapped = appointments.map((appt) => {
      const date = new Date(appt.date_time);
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const time = `${hours}:${minutes}`;

      // Duração em minutos – uso service.duration como base
      const duration = Number(appt.service.duration ?? 60);

      // Texto de sessão/pacote
      let sessionInfo = "Avulsa";
      if (appt.package) {
        const current = appt.session_number ?? 1;
        sessionInfo = `Sessão ${current} de ${appt.package.total_sessions}`;
      }

      const hasCharge = appt.has_charge;

      // Cores por tipo de atendimento (simples por enquanto)
      let color = "bg-blue-100 border-blue-300 text-blue-900"; // default/avulso
      if (appt.package_id) {
        color = "bg-emerald-100 border-emerald-300 text-emerald-900";
      }
      if (appt.status === "REALIZADO") {
        color = "bg-slate-100 border-slate-300 text-slate-900";
      }

      return {
        id: appt.id,
        time,
        duration,
        clientName: appt.client.name,
        service: appt.service.name,
        sessionInfo,
        isRecurring: Boolean(appt.package_id),
        phone: appt.client.phone_whatsapp,
        color,
        hasCharge,
      };
    });

    return NextResponse.json({ appointments: mapped });
  } catch (error) {
    console.error("[GET /api/admin/agenda/day] ERRO:", error);
    return NextResponse.json(
      { error: "Erro ao carregar agenda do dia." },
      { status: 500 },
    );
  }
}
