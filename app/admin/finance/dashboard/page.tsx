// app/admin/finance/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin-header";
import { FinanceHeader } from "@/components/finance/finance-header";
import { FinanceSecondaryIndicators } from "@/components/finance/finance-secondary-indicators";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { RecentTransactionsList } from "@/components/finance/recent-transactions-list";
import {
  mockFinanceSummary,
  mockRecentTransactions,
  mockSecondaryIndicators,
} from "@/lib/finance-mocks";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FinanceDashboardPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // Lógica para mostrar/esconder o botão de voltar ao topo
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dados mockados (no futuro virão via SWR ou Server Actions)
  const summaryData = mockFinanceSummary;
  const secondaryData = mockSecondaryIndicators;
  const recentTransactions = mockRecentTransactions;

  return (
    <>
      {/* Header Global do Admin */}
      <AdminHeader title="Financeiro" />

      {/* Container Principal Mobile First */}
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 md:pb-6 relative">
        {/* Cabeçalho Local: Título da Seção e Botões de Ação */}
        <FinanceHeader />

        {/* Cards Principais (Scroll Horizontal no Mobile, Grid no Desktop) */}
        <FinanceSummaryCards data={summaryData} />

        {/* Indicadores Secundários (Grid 2x2 no Mobile, 4x1 no Desktop) */}
        <div className="mt-2 md:mt-0">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            Visão Rápida
          </h3>
          <FinanceSecondaryIndicators data={secondaryData} />
        </div>

        {/* Lista de Histórico (Cards sem borda no mobile, Card com borda no desktop) */}
        <div className="mt-2 md:mt-0">
          <RecentTransactionsList data={recentTransactions} />
        </div>
      </div>

      {/* Botão Flutuante de Voltar ao Topo */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed bottom-20 md:bottom-8 right-4 md:right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 z-50",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none",
        )}
        aria-label="Voltar ao topo"
      >
        <ArrowUp className="h-5 w-5" strokeWidth={2.5} />
      </button>
    </>
  );
}
