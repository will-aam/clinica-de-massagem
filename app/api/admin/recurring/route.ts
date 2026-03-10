// app/api/admin/recurring/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  try {
    const admin = await requireAuth();

    // 1. Busca todos os agendamentos que possuem um recurrence_id (fazem parte de uma série)
    // Ordenamos por data para facilitar a descoberta do Início e Fim da série
    const appointments = await prisma.appointment.findMany({
      where: {
        organization_id: admin.organizationId,
        recurrence_id: { not: null },
      },
      include: {
        client: { select: { id: true, name: true, phone_whatsapp: true } },
        service: { select: { name: true } },
        package: {
          select: {
            id: true,
            name: true,
            total_sessions: true,
            used_sessions: true,
          },
        },
      },
      orderBy: {
        date_time: "asc",
      },
    });

    // 2. Agrupa os agendamentos pelo recurrence_id
    const grouped: Record<string, typeof appointments> = {};
    for (const appt of appointments) {
      const rid = appt.recurrence_id as string;
      if (!grouped[rid]) grouped[rid] = [];
      grouped[rid].push(appt);
    }

    const now = new Date();

    // 3. Monta o objeto final calculando os Alertas, Início, Fim e Padrão
    const recurringSeries = Object.entries(grouped).map(
      ([recurrenceId, series]) => {
        const firstAppt = series[0];
        const lastAppt = series[series.length - 1];

        // Descobre a próxima sessão pendente no futuro
        const nextSession = series.find(
          (a) =>
            new Date(a.date_time) >= now &&
            a.status !== "CANCELADO" &&
            a.status !== "REALIZADO",
        );

        // Quantos agendamentos restam realizar nessa série?
        const remainingInSeries = series.filter(
          (a) =>
            new Date(a.date_time) >= now &&
            a.status !== "CANCELADO" &&
            a.status !== "REALIZADO",
        ).length;

        // Monta a string do Padrão. Ex: "Toda terça-feira às 14:00"
        const startDate = new Date(firstAppt.date_time);
        const dayOfWeek = startDate
          .toLocaleDateString("pt-BR", { weekday: "long" })
          .split("-")[0];
        const timeStr = startDate.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const pattern = `Toda ${dayOfWeek} às ${timeStr}`;

        // Alertas Inteligentes (Onde a mágica acontece)
        const warnings: string[] = [];
        let packageBalance = null;

        if (firstAppt.package) {
          packageBalance =
            firstAppt.package.total_sessions - firstAppt.package.used_sessions;

          if (packageBalance < remainingInSeries && remainingInSeries > 0) {
            warnings.push(
              `O pacote tem saldo de ${packageBalance} sessões, mas há ${remainingInSeries} sessões futuras na agenda.`,
            );
          }
        }

        return {
          recurrenceId,
          client: firstAppt.client,
          serviceName: firstAppt.service.name,
          package: firstAppt.package,
          startDate: firstAppt.date_time,
          endDate: lastAppt.date_time,
          pattern, // Ex: "Toda terça às 08:00"
          totalSessions: series.length,
          completedSessions: series.filter((a) => a.status === "REALIZADO")
            .length,
          remainingInSeries,
          packageBalance,
          nextSession: nextSession ? nextSession.date_time : null,
          warnings,
          status: remainingInSeries === 0 ? "FINALIZADA" : "ATIVA",
        };
      },
    );

    // Filtra para exibir primeiro as Ativas que possuem Alertas, depois as outras Ativas.
    // As finalizadas vão pro final.
    recurringSeries.sort((a, b) => {
      if (a.status !== b.status) return a.status === "ATIVA" ? -1 : 1;
      if (a.warnings.length !== b.warnings.length)
        return b.warnings.length - a.warnings.length;
      return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
    });

    return NextResponse.json({ series: recurringSeries });
  } catch (error) {
    console.error("[GET /api/admin/recurring] Erro:", error);
    return NextResponse.json(
      { error: "Erro ao buscar séries recorrentes" },
      { status: 500 },
    );
  }
}
