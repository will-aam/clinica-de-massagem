// components/finance/finance-header.tsx

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { TransactionModal } from "@/components/finance/transaction-modal";
import { TransactionType } from "@/types/finance";

export function FinanceHeader() {
  // Estados para controlar o modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] =
    useState<TransactionType>("INCOME");

  const handleNewIncome = () => {
    setTransactionType("INCOME"); // Avisa o modal que é uma Receita
    setIsModalOpen(true);
  };

  const handleNewExpense = () => {
    setTransactionType("EXPENSE"); // Avisa o modal que é uma Despesa
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

        {/* Botoes empilhados no mobile e lado a lado no desktop */}
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

      {/* Renderiza o modal mágico aqui (invisível até isModalOpen ser true) */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        type={transactionType}
      />
    </>
  );
}
