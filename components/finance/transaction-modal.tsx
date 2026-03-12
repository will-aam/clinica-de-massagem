// components/finance/transaction-modal.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TransactionType,
  TransactionStatus,
  PaymentMethod,
} from "@/types/finance";
import { mockPaymentMethods } from "@/lib/finance-mocks";
import { ArrowDownCircle, ArrowUpCircle, CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType; // 'INCOME' (Receita) ou 'EXPENSE' (Despesa)
  // No futuro podemos passar um 'transaction' aqui para modo de Edição
}

export function TransactionModal({
  isOpen,
  onClose,
  type,
}: TransactionModalProps) {
  // Estados do formulário
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().split("T")[0],
  ); // YYYY-MM-DD
  const [status, setStatus] = useState<TransactionStatus>("PAID");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("");

  const isIncome = type === "INCOME";

  // Reseta o formulário sempre que o modal abrir
  useEffect(() => {
    if (isOpen) {
      setDescription("");
      setAmount("");
      setDate(new Date().toISOString().split("T")[0]);
      setStatus("PAID");
      setPaymentMethodId("");
    }
  }, [isOpen, type]);

  const handleSave = () => {
    // TODO: Integração futura com Prisma/Backend
    console.log("Salvar Movimentação:", {
      type,
      description,
      amount,
      date,
      status,
      paymentMethodId,
    });
    onClose();
  };

  const isSaveDisabled = !description || !amount || !date;

  // Classe mágica do Tailwind para sumir com as setinhas dos inputs de número
  const hideNumberArrows =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  // Filtra apenas os meios de pagamento ativos para mostrar no Select
  const activePaymentMethods = mockPaymentMethods.filter((pm) => pm.isActive);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 overflow-hidden">
        {/* Container com rolagem invisível */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SheetHeader className="text-left space-y-4">
            {/* Ícone e Título Dinâmicos baseados no Tipo */}
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "p-2 rounded-full",
                  isIncome
                    ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400",
                )}
              >
                {isIncome ? (
                  <ArrowUpCircle className="h-6 w-6" />
                ) : (
                  <ArrowDownCircle className="h-6 w-6" />
                )}
              </div>
              <div>
                <SheetTitle className="text-2xl">
                  {isIncome ? "Nova Receita" : "Nova Despesa"}
                </SheetTitle>
                <SheetDescription>
                  {isIncome
                    ? "Registe uma nova entrada financeira."
                    : "Registe uma nova saída ou custo."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-5 py-2">
            {/* Valor (Em destaque) */}
            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm font-semibold",
                  isIncome
                    ? "text-emerald-600 dark:text-emerald-500"
                    : "text-rose-600 dark:text-rose-500",
                )}
              >
                Valor da {isIncome ? "Receita" : "Despesa"} *
              </Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className={cn(
                    "h-14 rounded-xl pl-10 text-xl font-bold",
                    hideNumberArrows,
                  )}
                  placeholder="0.00"
                />
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={
                  isIncome
                    ? "Ex: Pacote de Depilação - Maria"
                    : "Ex: Conta de Luz"
                }
                className="h-12 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Data */}
              <div className="space-y-2">
                <Label>Data *</Label>
                <div className="relative">
                  <Input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12 rounded-xl"
                  />
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as TransactionStatus)}
                >
                  <SelectTrigger className="h-12 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="PAID">Pago / Realizado</SelectItem>
                    <SelectItem value="PENDING">Pendente / A Pagar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Meio de Pagamento */}
            <div className="space-y-2">
              <Label>Meio de Pagamento</Label>
              <Select
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
              >
                <SelectTrigger className="h-12 rounded-xl">
                  <SelectValue placeholder="Selecione como foi pago" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {/* Puxando os métodos dinamicamente do nosso Mock! */}
                  {activePaymentMethods.map((pm) => (
                    <SelectItem key={pm.id} value={pm.id}>
                      {pm.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Rodapé Fixo */}
        <div className="p-6 pt-4 border-t border-border/50 bg-background">
          <SheetFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button
              className={cn(
                "flex-1 h-12 rounded-xl text-white",
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700",
              )}
              onClick={handleSave}
              disabled={isSaveDisabled}
            >
              Salvar
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
