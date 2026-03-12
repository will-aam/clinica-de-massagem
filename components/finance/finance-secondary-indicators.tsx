// components/finance/finance-secondary-indicators.tsx

import { Card, CardContent } from "@/components/ui/card";
import { PaymentMethod, SecondaryIndicators } from "@/types/finance";
import {
  AlertCircle,
  CalendarDays,
  CalendarRange,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FinanceSecondaryIndicatorsProps {
  data: SecondaryIndicators;
}

export function FinanceSecondaryIndicators({
  data,
}: FinanceSecondaryIndicatorsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const paymentMethodMap: Record<PaymentMethod, string> = {
    PIX: "Pix",
    CREDIT_CARD: "Cartão de Crédito",
    DEBIT_CARD: "Cartão de Débito",
    CASH: "Dinheiro",
    OTHER: "Outros",
  };

  // Classes padrão para o card fazer o efeito de snap no mobile e ter a largura ideal
  const cardClasses =
    "min-w-[85vw] md:min-w-0 snap-center shrink-0 shadow-none border-dashed";

  return (
    <div className="flex overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-2 lg:grid-cols-4 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-4 [&::-webkit-scrollbar]:hidden">
      {/* Recebido Hoje */}
      <Card className={cardClasses}>
        <CardContent className="p-4 flex flex-row items-center gap-4">
          <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full shrink-0">
            <CalendarDays className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate">
              Hoje
            </p>
            <p className="text-lg font-bold truncate">
              {formatCurrency(data.receivedToday)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Recebido na Semana */}
      <Card className={cardClasses}>
        <CardContent className="p-4 flex flex-row items-center gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
            <CalendarRange className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate">
              Na Semana
            </p>
            <p className="text-lg font-bold truncate">
              {formatCurrency(data.receivedWeek)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quantidade de Pendentes */}
      <Card className={cardClasses}>
        <CardContent className="p-4 flex flex-row items-center gap-4">
          <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full shrink-0">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate">
              Qtd. Pendentes
            </p>
            <p className="text-lg font-bold truncate">
              {data.pendingCount}{" "}
              <span className="text-sm font-normal text-muted-foreground">
                itens
              </span>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Meio mais usado */}
      <Card className={cardClasses}>
        <CardContent className="p-4 flex flex-row items-center gap-4">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full shrink-0">
            <CreditCard className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground font-medium truncate">
              Meio Favorito
            </p>
            <p className="text-sm font-bold mt-1 truncate">
              {data.topPaymentMethod
                ? paymentMethodMap[data.topPaymentMethod]
                : "-"}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
