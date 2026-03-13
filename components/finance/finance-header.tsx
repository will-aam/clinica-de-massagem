// components/finance/finance-header.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MinusCircle, PlusCircle } from "lucide-react";
import { TransactionModal } from "@/components/finance/transaction-modal";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FinanceHeaderProps {
  onSuccess?: () => void;
  selectedMonth: number;
  selectedYear: number;
  onMonthChange: (m: number) => void;
  onYearChange: (y: number) => void;
}

const MONTHS = [
  { value: 1, label: "Janeiro" },
  { value: 2, label: "Fevereiro" },
  { value: 3, label: "Março" },
  { value: 4, label: "Abril" },
  { value: 5, label: "Maio" },
  { value: 6, label: "Junho" },
  { value: 7, label: "Julho" },
  { value: 8, label: "Agosto" },
  { value: 9, label: "Setembro" },
  { value: 10, label: "Outubro" },
  { value: 11, label: "Novembro" },
  { value: 12, label: "Dezembro" },
];

export function FinanceHeader({
  onSuccess,
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
}: FinanceHeaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<"INCOME" | "EXPENSE">(
    "INCOME",
  );

  const currentYear = new Date().getFullYear();
  const startYear = 2026;
  const YEARS = Array.from(
    { length: currentYear - startYear + 2 },
    (_, i) => startYear + i,
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Acompanhe e gira as movimentações do seu negócio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
          {/* 🔥 FILTROS DE MÊS E ANO - MINIMALISTAS E ELEGANTES */}
          <div className="flex items-center justify-start gap-1 w-full sm:w-auto mb-2 sm:mb-0">
            <Select
              value={selectedMonth.toString()}
              onValueChange={(val) => onMonthChange(Number(val))}
            >
              <SelectTrigger className="h-10 w-31.25 border-none bg-transparent shadow-none focus:ring-0 font-bold text-base sm:text-lg px-2 hover:text-primary transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {MONTHS.map((m) => (
                  <SelectItem
                    key={m.value}
                    value={m.value.toString()}
                    className="rounded-lg"
                  >
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedYear.toString()}
              onValueChange={(val) => onYearChange(Number(val))}
            >
              <SelectTrigger className="h-10 w-21.25 border-none bg-transparent shadow-none focus:ring-0 font-bold text-base sm:text-lg px-2 hover:text-primary transition-colors">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {YEARS.map((y) => (
                  <SelectItem
                    key={y}
                    value={y.toString()}
                    className="rounded-lg"
                  >
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Oculta o separador vertical no mobile para não poluir */}
          <div className="h-8 w-px bg-border/50 hidden sm:block mx-2" />

          {/* BOTÕES DE AÇÃO */}
          <Button
            variant="outline"
            className="w-full sm:w-auto text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:text-rose-500 dark:border-rose-900 dark:hover:bg-rose-950/50 justify-center h-11 sm:h-10 rounded-xl"
            onClick={handleNewExpense}
          >
            <MinusCircle className="mr-2 h-4 w-4" />
            Despesa
          </Button>

          <Button
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white justify-center h-11 sm:h-10 rounded-xl"
            onClick={handleNewIncome}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Receita
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
