// components/finance/finance-header.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { TransactionModal } from "@/components/finance/transaction-modal";

interface FinanceHeaderProps {
  onSuccess?: () => void;
}

export function FinanceHeader({ onSuccess }: FinanceHeaderProps) {
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // AJUSTE: Usamos as strings literais que o modal espera para a interface
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">(
    "INCOME",
  );

  const handleNewIncome = () => {
    setTransactionType("INCOME");
    setIsModalOpen(true);
  };

  const handleNewExpense = () => {
    setTransactionType("EXPENSE");
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe e gira as movimentações do seu negócio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
          <Button
            variant="outline"
            className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:text-rose-500 dark:border-rose-900 dark:hover:bg-rose-950/50 justify-center"
            onClick={handleNewExpense}
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Nova Despesa
          </Button>

          <Button
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white justify-center"
            onClick={handleNewIncome}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Receita
          </Button>
        </div>
      </div>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onSuccess) onSuccess();
        }}
        type={transactionType}
      />
    </>
  );
}
