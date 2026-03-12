// components/finance/finance-summary-cards.tsx

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FinanceSummary } from "@/types/finance";
import { ArrowDownCircle, ArrowUpCircle, Clock, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceSummaryCardsProps {
  data: FinanceSummary;
}

export function FinanceSummaryCards({ data }: FinanceSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  // Classe base para garantir que o card ocupe 85% da tela no mobile e faça o "snap" (parada)
  const cardClasses =
    "min-w-[85vw] md:min-w-0 snap-center shrink-0 flex flex-col justify-between shadow-sm border-border";

  return (
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-4 [&::-webkit-scrollbar]:hidden">
      {/* Card: Total Recebido */}
      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Recebido no Mês
          </CardTitle>
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
            <ArrowUpCircle className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(data.receivedMonth)}
          </div>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Valores já pagos
          </p>
        </CardContent>
      </Card>

      {/* Card: Total Pendente */}
      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Pendente no Mês
          </CardTitle>
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(data.pendingMonth)}
          </div>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Aguardando pagamento
          </p>
        </CardContent>
      </Card>

      {/* Card: Despesas */}
      <Card className={cardClasses}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Despesas do Mês
          </CardTitle>
          <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-full">
            <ArrowDownCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {formatCurrency(data.expensesMonth)}
          </div>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Custos operacionais
          </p>
        </CardContent>
      </Card>

      {/* Card: Saldo */}
      <Card
        className={cn(
          cardClasses,
          "bg-slate-50 dark:bg-slate-900/50 border-blue-100 dark:border-blue-900",
        )}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Saldo do Mês
          </CardTitle>
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Wallet className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-500 tracking-tight">
            {formatCurrency(data.balanceMonth)}
          </div>
          <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
            Recebido - Despesas
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
