"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

/**
 * Busca todos os pacotes da organização e calcula os KPIs em tempo real.
 */
export async function getPackagesDashboardData() {
  try {
    const admin = await requireAuth();

    // 1. Busca os pacotes vinculando com o nome do cliente e do serviço
    const packages = await prisma.package.findMany({
      where: {
        organization_id: admin.organizationId,
      },
      include: {
        client: { select: { name: true } },
        service: { select: { name: true } },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    // 2. Calcula KPIs dinamicamente
    const activeCount = packages.filter((p) => p.active).length;

    // Pacotes onde restam 2 ou menos sessões
    const endingSoonCount = packages.filter(
      (p) =>
        p.active &&
        p.used_sessions >= p.total_sessions - 2 &&
        p.used_sessions < p.total_sessions,
    ).length;

    // Soma de todas as sessões que ainda não foram realizadas
    const totalPendingSessions = packages.reduce(
      (acc, p) => acc + (p.total_sessions - p.used_sessions),
      0,
    );

    return {
      success: true,
      packages: packages.map((p) => ({
        id: p.id,
        clientName: p.client.name,
        packageName: p.service.name,
        usedSessions: p.used_sessions,
        totalSessions: p.total_sessions,
        active: p.active,
      })),
      kpis: {
        active: activeCount,
        endingSoon: endingSoonCount,
        totalPending: totalPendingSessions,
      },
    };
  } catch (error) {
    console.error("Erro ao carregar dashboard de pacotes:", error);
    return { success: false, error: "Falha ao carregar dados." };
  }
}
/**
 * Busca o histórico de agendamentos vinculados a um pacote específico.
 */
export async function getPackageHistory(packageId: string) {
  try {
    const admin = await requireAuth();

    const appointments = await prisma.appointment.findMany({
      where: {
        package_id: packageId,
        organization_id: admin.organizationId,
      },
      orderBy: {
        date_time: "asc", // Mostra da primeira sessão para a última
      },
    });

    return {
      success: true,
      history: appointments.map((appt) => ({
        id: appt.id,
        session: appt.session_number,
        date: appt.date_time,
        status: appt.status, // PENDENTE, REALIZADO, etc.
        obs: appt.observations,
      })),
    };
  } catch (error) {
    console.error("Erro ao buscar histórico do pacote:", error);
    return { success: false, error: "Falha ao carregar histórico." };
  }
}
