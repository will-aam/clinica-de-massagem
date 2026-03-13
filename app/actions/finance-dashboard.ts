// app/actions/finance-dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
} from "date-fns";
import { PaymentMethod } from "@prisma/client";

async function getAdminOrg() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");
  const admin = await prisma.admin.findUnique({
    where: { email: session.user.email },
    include: { organizations: true },
  });
  if (!admin || admin.organizations.length === 0)
    throw new Error("Organização não encontrada");
  return admin.organizations[0].id;
}

export async function getFinanceDashboardData() {
  try {
    const organizationId = await getAdminOrg();
    const now = new Date();

    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const weekStart = startOfWeek(now, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

    // 1. Buscar Agendamentos REALIZADOS no mês inteiro
    const completedAppointments = await prisma.appointment.findMany({
      where: {
        organization_id: organizationId,
        status: "REALIZADO",
        date_time: { gte: monthStart, lte: monthEnd },
      },
      include: { service: true, client: true },
    });

    // 2. Buscar Transações Manuais do mês
    const monthTransactions = await prisma.transaction.findMany({
      where: {
        organization_id: organizationId,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: "desc" },
      include: { client: true, payment_method: true },
    });

    // --- CÁLCULOS DO SUMÁRIO (CARDS PRINCIPAIS) ---
    const incomeFromAppts = completedAppointments.reduce(
      (acc, curr) => acc + Number(curr.service.price),
      0,
    );
    const incomeFromTx = monthTransactions
      .filter((t) => t.type === "RECEITA" && t.status === "PAGO")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // 🔥 AGORA SOMAMOS O CUSTO DE MATERIAL DAS CONSULTAS REALIZADAS
    const expensesFromAppts = completedAppointments.reduce(
      (acc, curr) => acc + Number(curr.service.material_cost || 0),
      0,
    );
    const expensesFromTx = monthTransactions
      .filter((t) => t.type === "DESPESA" && t.status === "PAGO")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const pendingFromTx = monthTransactions
      .filter((t) => t.status === "PENDENTE")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // --- CÁLCULOS DOS INDICADORES SECUNDÁRIOS ---
    const receivedToday =
      completedAppointments
        .filter((a) => a.date_time >= todayStart && a.date_time <= todayEnd)
        .reduce((acc, curr) => acc + Number(curr.service.price), 0) +
      monthTransactions
        .filter(
          (t) =>
            t.type === "RECEITA" &&
            t.status === "PAGO" &&
            t.date >= todayStart &&
            t.date <= todayEnd,
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const receivedWeek =
      completedAppointments
        .filter((a) => a.date_time >= weekStart && a.date_time <= weekEnd)
        .reduce((acc, curr) => acc + Number(curr.service.price), 0) +
      monthTransactions
        .filter(
          (t) =>
            t.type === "RECEITA" &&
            t.status === "PAGO" &&
            t.date >= weekStart &&
            t.date <= weekEnd,
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // Descobrir o Meio de Pagamento mais usado
    const paymentCounts: Record<string, number> = {};
    completedAppointments.forEach((a) => {
      if (a.payment_method)
        paymentCounts[a.payment_method] =
          (paymentCounts[a.payment_method] || 0) + 1;
    });
    monthTransactions.forEach((t) => {
      if (
        t.type === "RECEITA" &&
        t.status === "PAGO" &&
        t.payment_method?.type
      ) {
        paymentCounts[t.payment_method.type] =
          (paymentCounts[t.payment_method.type] || 0) + 1;
      }
    });

    let topPaymentMethod: PaymentMethod | null = null;
    let maxCount = 0;
    for (const [method, count] of Object.entries(paymentCounts)) {
      if (count > maxCount) {
        maxCount = count;
        topPaymentMethod = method as PaymentMethod;
      }
    }

    // --- MONTAR HISTÓRICO RECENTE DINÂMICO ---
    const historyFromAppts = completedAppointments.flatMap((a) => {
      const items = [];

      // Linha 1: A Receita (O valor pago pelo cliente)
      items.push({
        id: `rec_${a.id}`,
        type: "RECEITA" as const,
        description: a.service.name,
        amount: Number(a.service.price),
        date: a.date_time.toISOString(),
        status: "PAGO" as const,
        clientName: a.client.name,
        paymentMethod: a.payment_method || undefined,
      });

      // 🔥 Linha 2: A Despesa de Material (Se o serviço tiver custo)
      if (a.service.material_cost && Number(a.service.material_cost) > 0) {
        items.push({
          id: `custo_${a.id}`,
          type: "DESPESA" as const,
          description: `Insumos: ${a.service.name}`,
          amount: Number(a.service.material_cost),
          date: a.date_time.toISOString(),
          status: "PAGO" as const,
          clientName: a.client.name, // Mostra o nome do cliente pra saber de qual atendimento foi
        });
      }
      return items;
    });

    const historyFromTx = monthTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      status: t.status,
      clientName: t.client?.name,
      paymentMethod: t.payment_method?.type || undefined,
    }));

    const allHistory = [...historyFromAppts, ...historyFromTx]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 15); // Aumentei para 15 itens já que agora gera 2 linhas por check-in

    return {
      summary: {
        receivedMonth: incomeFromAppts + incomeFromTx,
        pendingMonth: pendingFromTx,
        expensesMonth: expensesFromTx + expensesFromAppts, // 🔥 Soma total real
        balanceMonth:
          incomeFromAppts + incomeFromTx - (expensesFromTx + expensesFromAppts),
      },
      secondary: {
        receivedToday,
        receivedWeek,
        pendingCount: monthTransactions.filter((t) => t.status === "PENDENTE")
          .length,
        topPaymentMethod,
      },
      recentTransactions: allHistory,
    };
  } catch (error) {
    console.error("Dashboard Error:", error);
    return null;
  }
}
