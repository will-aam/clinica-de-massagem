// app/actions/finance-dashboard.ts
"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

export async function getFinanceDashboardData(month?: number, year?: number) {
  try {
    const organizationId = await getAdminOrg();
    const now = new Date();

    const targetMonth = month ? month - 1 : now.getMonth();
    const targetYear = year || now.getFullYear();

    // 1. LIMITES DO MÊS FILTRADO (Fuso Local)
    const monthStart = new Date(targetYear, targetMonth, 1, 0, 0, 0);
    const monthEnd = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // 2. LIMITES DE HOJE E ONTEM (Para Visão Rápida e Histórico Recente)
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0,
      0,
      0,
    );
    const todayEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    const yesterdayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      0,
      0,
      0,
    );

    const dayOfWeek = now.getDay();
    const weekStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - dayOfWeek,
      0,
      0,
      0,
    );
    const weekEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (6 - dayOfWeek),
      23,
      59,
      59,
      999,
    );

    // --- BUSCA DOS DADOS DO MÊS FILTRADO ---
    const filteredAppointments = await prisma.appointment.findMany({
      where: {
        organization_id: organizationId,
        status: "REALIZADO",
        date_time: { gte: monthStart, lte: monthEnd },
      },
      include: { service: true, client: true },
    });

    const filteredTransactions = await prisma.transaction.findMany({
      where: {
        organization_id: organizationId,
        date: { gte: monthStart, lte: monthEnd },
      },
      orderBy: { date: "desc" },
      include: { client: true, payment_method: true },
    });

    // --- CÁLCULOS DOS CARDS DO MÊS FILTRADO ---

    // Receitas da Agenda (Só soma se o método de pagamento foi preenchido)
    const incomeFromAppts = filteredAppointments
      .filter((a) => a.payment_method !== null)
      .reduce((acc, curr) => acc + Number(curr.service.price), 0);

    // Pendentes da Agenda (Realizados mas aguardando pagamento)
    const pendingFromAppts = filteredAppointments
      .filter((a) => a.payment_method === null)
      .reduce((acc, curr) => acc + Number(curr.service.price), 0);

    // Despesas de Insumos da Agenda (Independente de pagamento, o material foi gasto)
    const expensesFromAppts = filteredAppointments.reduce(
      (acc, curr) => acc + Number(curr.service.material_cost || 0),
      0,
    );

    // Transações Manuais (Receitas e Despesas Avulsas)
    const incomeFromTx = filteredTransactions
      .filter((t) => t.type === "RECEITA" && t.status === "PAGO")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const expensesFromTx = filteredTransactions
      .filter((t) => t.type === "DESPESA" && t.status === "PAGO")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const pendingFromTx = filteredTransactions
      .filter((t) => t.status === "PENDENTE")
      .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // --- CÁLCULOS DA VISÃO RÁPIDA (SEMPRE A SEMANA ATUAL) ---
    const currentWeekAppointments = await prisma.appointment.findMany({
      where: {
        organization_id: organizationId,
        status: "REALIZADO",
        date_time: { gte: weekStart, lte: weekEnd },
      },
      include: { service: true },
    });
    const currentWeekTransactions = await prisma.transaction.findMany({
      where: {
        organization_id: organizationId,
        date: { gte: weekStart, lte: weekEnd },
      },
    });

    const receivedToday =
      currentWeekAppointments
        .filter(
          (a) =>
            a.date_time >= todayStart &&
            a.date_time <= todayEnd &&
            a.payment_method !== null,
        )
        .reduce((acc, curr) => acc + Number(curr.service.price), 0) +
      currentWeekTransactions
        .filter(
          (t) =>
            t.type === "RECEITA" &&
            t.status === "PAGO" &&
            t.date >= todayStart &&
            t.date <= todayEnd,
        )
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    const receivedWeek =
      currentWeekAppointments
        .filter((a) => a.payment_method !== null)
        .reduce((acc, curr) => acc + Number(curr.service.price), 0) +
      currentWeekTransactions
        .filter((t) => t.type === "RECEITA" && t.status === "PAGO")
        .reduce((acc, curr) => acc + Number(curr.amount), 0);

    // --- MEIO DE PAGAMENTO FAVORITO (DO MÊS FILTRADO) ---
    const paymentCounts: Record<string, number> = {};
    filteredAppointments.forEach((a) => {
      if (a.payment_method)
        paymentCounts[a.payment_method] =
          (paymentCounts[a.payment_method] || 0) + 1;
    });
    filteredTransactions.forEach((t) => {
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

    // --- MONTAR HISTÓRICO (APENAS ONTEM E HOJE) ---
    const historyFromAppts = filteredAppointments.flatMap((a) => {
      const items = [];

      // Linha 1: A Receita (Se estiver sem pagamento, aparece como PENDENTE amarelo)
      items.push({
        id: `rec_${a.id}`,
        type: "RECEITA" as const,
        description: a.service.name,
        amount: Number(a.service.price),
        date: a.date_time.toISOString(),
        // 🔥 AJUSTE AQUI: Forçamos a tipagem exata para o TypeScript parar de chorar
        status: (a.payment_method ? "PAGO" : "PENDENTE") as "PAGO" | "PENDENTE",
        clientName: a.client.name,
        paymentMethod: a.payment_method || undefined,
      });

      // Linha 2: A Despesa de Material
      if (a.service.material_cost && Number(a.service.material_cost) > 0) {
        items.push({
          id: `custo_${a.id}`,
          type: "DESPESA" as const,
          description: `Insumos: ${a.service.name}`,
          amount: Number(a.service.material_cost),
          date: a.date_time.toISOString(),
          status: "PAGO" as const,
          clientName: a.client.name,
        });
      }
      return items;
    });

    const historyFromTx = filteredTransactions.map((t) => ({
      id: t.id,
      type: t.type,
      description: t.description,
      amount: Number(t.amount),
      date: t.date.toISOString(),
      status: t.status,
      clientName: t.client?.name,
      paymentMethod: t.payment_method?.type || undefined,
    }));

    // 🔥 FILTRO MÁGICO: Exibe apenas os registros de Ontem e Hoje no máximo!
    const allHistory = [...historyFromAppts, ...historyFromTx]
      .filter((h) => new Date(h.date) >= yesterdayStart)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      summary: {
        receivedMonth: incomeFromAppts + incomeFromTx,
        pendingMonth: pendingFromAppts + pendingFromTx, // Soma agenda pendente + manual pendente
        expensesMonth: expensesFromAppts + expensesFromTx, // Soma insumos + manuais
        balanceMonth:
          incomeFromAppts + incomeFromTx - (expensesFromAppts + expensesFromTx),
      },
      secondary: {
        receivedToday,
        receivedWeek,
        pendingCount: pendingFromAppts + pendingFromTx,
        topPaymentMethod,
      },
      recentTransactions: allHistory,
    };
  } catch (error) {
    console.error("Dashboard Error:", error);
    return null;
  }
}
