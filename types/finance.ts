// types/finance.ts

export type TransactionType = "INCOME" | "EXPENSE";
export type TransactionStatus = "PAID" | "PENDING" | "OVERDUE";
export type PaymentMethod =
  | "PIX"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CASH"
  | "OTHER";

export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO string ou YYYY-MM-DD
  paymentMethod?: PaymentMethod;
  status: TransactionStatus;
  clientId?: string;
  clientName?: string;
}

export interface FinanceSummary {
  receivedMonth: number;
  pendingMonth: number;
  expensesMonth: number;
  balanceMonth: number;
}

export interface SecondaryIndicators {
  receivedToday: number;
  receivedWeek: number;
  pendingCount: number;
  topPaymentMethod: PaymentMethod | null;
}

// NOVO: Interface para a configuração dos meios de pagamento da clínica/salão
export interface OrganizationPaymentMethod {
  id: string;
  type: PaymentMethod; // O enum base do sistema
  name: string; // Nome customizado (ex: "Cartão de Crédito - Stone")
  isActive: boolean; // Se o cliente aceita ou não essa forma
  feePercentage: number; // Taxa em % (ex: 1.99)
  feeFixed: number; // Taxa fixa em R$ (ex: 0.50)
  daysToReceive: number; // Dias para o dinheiro cair na conta (0 = na hora)
}
