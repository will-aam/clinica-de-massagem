// lib/finance-mocks.ts

import {
  FinanceSummary,
  SecondaryIndicators,
  Transaction,
  OrganizationPaymentMethod,
} from "@/types/finance";

export const mockFinanceSummary: FinanceSummary = {
  receivedMonth: 12500.0,
  pendingMonth: 3200.0,
  expensesMonth: 4800.0,
  balanceMonth: 7700.0,
};

export const mockSecondaryIndicators: SecondaryIndicators = {
  receivedToday: 450.0,
  receivedWeek: 3200.0,
  pendingCount: 8,
  topPaymentMethod: "PIX",
};

const today = new Date();
const getRelativeDate = (daysAgo: number) => {
  const date = new Date(today);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString();
};

export const mockRecentTransactions: Transaction[] = [
  {
    id: "txn-001",
    type: "INCOME",
    description: "Limpeza de Pele - Ana Silva",
    amount: 150.0,
    date: getRelativeDate(0),
    paymentMethod: "PIX",
    status: "PAID",
    clientName: "Ana Silva",
  },
  {
    id: "txn-002",
    type: "EXPENSE",
    description: "Aluguel do Espaço",
    amount: 1200.0,
    date: getRelativeDate(1),
    paymentMethod: "OTHER",
    status: "PAID",
  },
  {
    id: "txn-003",
    type: "INCOME",
    description: "Pacote Depilação a Laser - Maria",
    amount: 300.0,
    date: getRelativeDate(1),
    paymentMethod: "CREDIT_CARD",
    status: "PAID",
    clientName: "Maria Oliveira",
  },
  {
    id: "txn-004",
    type: "EXPENSE",
    description: "Compra de Cremes e Descartáveis",
    amount: 85.0,
    date: getRelativeDate(2),
    paymentMethod: "DEBIT_CARD",
    status: "PAID",
  },
  {
    id: "txn-005",
    type: "INCOME",
    description: "Corte e Escova - Joana (Pendente)",
    amount: 120.0,
    date: getRelativeDate(3),
    status: "PENDING",
    clientName: "Joana Souza",
  },
];

// NOVO: Mocks para a tela de Configuração de Meios de Pagamento
export const mockPaymentMethods: OrganizationPaymentMethod[] = [
  {
    id: "pm-001",
    type: "PIX",
    name: "Pix",
    isActive: true,
    feePercentage: 0,
    feeFixed: 0,
    daysToReceive: 0,
  },
  {
    id: "pm-002",
    type: "CREDIT_CARD",
    name: "Cartão de Crédito (Stone)",
    isActive: true,
    feePercentage: 3.49,
    feeFixed: 0,
    daysToReceive: 30,
  },
  {
    id: "pm-003",
    type: "DEBIT_CARD",
    name: "Cartão de Débito (Stone)",
    isActive: true,
    feePercentage: 1.99,
    feeFixed: 0,
    daysToReceive: 1,
  },
  {
    id: "pm-004",
    type: "CASH",
    name: "Dinheiro Espécie",
    isActive: true,
    feePercentage: 0,
    feeFixed: 0,
    daysToReceive: 0,
  },
  {
    id: "pm-005",
    type: "OTHER",
    name: "Transferência Bancária (TED)",
    isActive: false, // Exemplo de um método que a clínica desativou
    feePercentage: 0,
    feeFixed: 0,
    daysToReceive: 1,
  },
];
