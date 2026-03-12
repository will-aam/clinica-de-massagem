// app/admin/finance/payment-methods/page.tsx
"use client";

import { useState, useEffect } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  CreditCard,
  Banknote,
  Landmark,
  QrCode,
  ArrowUp,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mockPaymentMethods } from "@/lib/finance-mocks";
import { OrganizationPaymentMethod } from "@/types/finance";
import { PaymentMethodModal } from "@/components/finance/payment-method-modal";

// Adicionámos a prop onClick ao sub-componente
function PaymentMethodListItem({
  method,
  onClick,
}: {
  method: OrganizationPaymentMethod;
  onClick: () => void;
}) {
  const getIcon = () => {
    switch (method.type) {
      case "PIX":
        return <QrCode className="h-5 w-5" />;
      case "CREDIT_CARD":
      case "DEBIT_CARD":
        return <CreditCard className="h-5 w-5" />;
      case "CASH":
        return <Banknote className="h-5 w-5" />;
      default:
        return <Landmark className="h-5 w-5" />;
    }
  };

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);

  const getTaxString = () => {
    if (method.feePercentage === 0 && method.feeFixed === 0) return "Sem taxa";
    const parts = [];
    if (method.feePercentage > 0) parts.push(`${method.feePercentage}%`);
    if (method.feeFixed > 0) parts.push(formatCurrency(method.feeFixed));
    return parts.join(" + ");
  };

  return (
    // Adicionámos o evento onClick na div principal
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3 md:py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-lg group cursor-pointer"
    >
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pr-4">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-sm border transition-transform group-hover:scale-105",
            method.isActive
              ? "bg-primary/10 text-primary border-primary/20"
              : "bg-muted text-muted-foreground border-border",
          )}
        >
          {getIcon()}
        </div>

        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-sm font-semibold leading-tight mb-1 truncate group-hover:underline transition-colors",
              method.isActive
                ? "text-foreground group-hover:text-primary"
                : "text-muted-foreground",
            )}
          >
            {method.name}
          </span>
          <span className="text-xs text-muted-foreground leading-none flex items-center gap-1.5 truncate">
            {method.daysToReceive === 0
              ? "Recebimento na hora"
              : `Recebimento em ${method.daysToReceive} dia(s)`}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1.5 shrink-0">
        <span
          className={cn(
            "text-sm font-bold",
            method.isActive ? "text-foreground" : "text-muted-foreground",
          )}
        >
          {getTaxString()}
        </span>
        {method.isActive ? (
          <Badge
            variant="secondary"
            className="bg-emerald-100/50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-none text-[10px] px-1.5 py-0 h-4"
          >
            Ativo
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="bg-muted text-muted-foreground border-none text-[10px] px-1.5 py-0 h-4"
          >
            Inativo
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function PaymentMethodsPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);

  // NOVOS ESTADOS PARA O MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] =
    useState<OrganizationPaymentMethod | null>(null);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  // Funções para abrir o modal
  const handleNewPaymentMethod = () => {
    setSelectedMethod(null); // Nulo = Modo Criação
    setIsModalOpen(true);
  };

  const handleEditPaymentMethod = (method: OrganizationPaymentMethod) => {
    setSelectedMethod(method); // Passa o método = Modo Edição
    setIsModalOpen(true);
  };

  return (
    <>
      <AdminHeader title="Meios de Pagamento" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 md:pb-6 relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Meios de Pagamento
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Configure as formas de pagamento que o seu negócio aceita e as
              respetivas taxas.
            </p>
          </div>

          <Button
            className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground justify-center mt-2 sm:mt-0"
            onClick={handleNewPaymentMethod}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Pagamento
          </Button>
        </div>

        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card mt-2 md:mt-0">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Settings2 className="h-5 w-5 text-primary" />
              Configurações Atuais
            </CardTitle>
            <CardDescription>
              Clique num item para editar as suas configurações de taxas e
              prazos.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
            <div className="flex flex-col">
              {mockPaymentMethods.map((method) => (
                <PaymentMethodListItem
                  key={method.id}
                  method={method}
                  onClick={() => handleEditPaymentMethod(method)} // Injetamos o evento aqui!
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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

      {/* RENDERIZAMOS O MODAL AQUI */}
      <PaymentMethodModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        method={selectedMethod}
      />
    </>
  );
}
