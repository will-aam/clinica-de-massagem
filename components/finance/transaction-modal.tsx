// components/finance/transaction-modal.tsx

"use client";

import { useEffect, useState, useTransition } from "react";
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
  OrganizationPaymentMethod,
} from "@/types/finance";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
// 🔥 Importamos a função de update também
import {
  createTransaction,
  updateTransaction,
} from "@/app/actions/transactions";
import { getPaymentMethods } from "@/app/actions/payment-methods";
import { useToast } from "@/hooks/use-toast";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "INCOME" | "EXPENSE";
  // 🔥 Adicionamos os dados iniciais opcionais para o modo de Edição
  initialData?: {
    id: string;
    description: string;
    amount: number;
    date: string;
    status: TransactionStatus;
    paymentMethodId?: string;
  } | null;
}

export function TransactionModal({
  isOpen,
  onClose,
  type,
  initialData,
}: TransactionModalProps) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [date, setDate] = useState<string>("");
  const [status, setStatus] = useState<TransactionStatus>("PAGO");
  const [paymentMethodId, setPaymentMethodId] = useState<string>("none");

  const [paymentMethods, setPaymentMethods] = useState<
    OrganizationPaymentMethod[]
  >([]);

  const isIncome = type === "INCOME";
  const isEditing = !!initialData;

  useEffect(() => {
    if (isOpen) {
      const loadMethods = async () => {
        const data = await getPaymentMethods();
        setPaymentMethods(data as OrganizationPaymentMethod[]);
      };
      loadMethods();

      // 🔥 Se for edição, preenche com os dados que vieram, senão zera tudo.
      if (initialData) {
        setDescription(initialData.description);
        setAmount(initialData.amount);
        // Garante que a data vem no formato YYYY-MM-DD para o input type="date"
        setDate(initialData.date.split("T")[0]);
        setStatus(initialData.status);
        setPaymentMethodId(initialData.paymentMethodId || "none");
      } else {
        setDescription("");
        setAmount("");
        setDate(new Date().toISOString().split("T")[0]);
        setStatus("PAGO");
        setPaymentMethodId("none");
      }
    }
  }, [isOpen, initialData]);

  const handleSave = () => {
    if (!description || !amount || !date) return;

    startTransition(async () => {
      const payload = {
        type: isIncome
          ? ("RECEITA" as TransactionType)
          : ("DESPESA" as TransactionType),
        description,
        amount: Number(amount),
        date,
        status,
        paymentMethodId:
          paymentMethodId === "none" ? undefined : paymentMethodId,
      };

      // 🔥 Se tiver ID, atualiza. Se não, cria.
      const result = isEditing
        ? await updateTransaction(initialData.id, payload)
        : await createTransaction(payload);

      if (result.success) {
        toast({
          title: "Sucesso",
          description: isEditing
            ? "Movimentação atualizada!"
            : "Movimentação registrada!",
        });
        onClose();
      } else {
        toast({
          title: "Erro",
          description: result.error,
          variant: "destructive",
        });
      }
    });
  };

  const isSaveDisabled = !description || !amount || !date || isPending;
  const hideNumberArrows =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => !open && !isPending && onClose()}
    >
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 overflow-hidden border-l-0 sm:border-l">
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SheetHeader className="text-left space-y-4">
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
                  {isEditing
                    ? isIncome
                      ? "Editar Receita"
                      : "Editar Despesa"
                    : isIncome
                      ? "Nova Receita"
                      : "Nova Despesa"}
                </SheetTitle>
                <SheetDescription>
                  {isEditing
                    ? "Atualize os dados desta movimentação."
                    : isIncome
                      ? "Registe uma nova entrada financeira."
                      : "Registe uma nova saída ou custo."}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          <div className="flex flex-col gap-5 py-2">
            <div className="space-y-2">
              <Label
                className={cn(
                  "text-sm font-semibold",
                  isIncome ? "text-emerald-600" : "text-rose-600",
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
                  onChange={(e) =>
                    setAmount(
                      e.target.value === "" ? "" : Number(e.target.value),
                    )
                  }
                  disabled={isPending}
                  className={cn(
                    "h-14 rounded-xl pl-10 text-xl font-bold bg-muted/30 border-none",
                    hideNumberArrows,
                  )}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Descrição *</Label>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isPending}
                placeholder={isIncome ? "Ex: Venda de Produto" : "Ex: Aluguel"}
                className="h-12 rounded-xl bg-muted/30 border-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data *</Label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  disabled={isPending}
                  className="h-12 rounded-xl bg-muted/30 border-none"
                />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(val) => setStatus(val as TransactionStatus)}
                  disabled={isPending}
                >
                  <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="PAGO">Pago / Realizado</SelectItem>
                    <SelectItem value="PENDENTE">Pendente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Meio de Pagamento</Label>
              <Select
                value={paymentMethodId}
                onValueChange={setPaymentMethodId}
                disabled={isPending}
              >
                <SelectTrigger className="h-12 rounded-xl bg-muted/30 border-none">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="none">
                    Nenhum / Dinheiro em mãos
                  </SelectItem>
                  {paymentMethods
                    .filter((pm) => pm.isActive)
                    .map((pm) => (
                      <SelectItem key={pm.id} value={pm.id}>
                        {pm.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="p-6 pt-4 border-t border-border/50 bg-background">
          <SheetFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 h-12 rounded-xl border-none bg-muted hover:bg-muted/80"
              onClick={onClose}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button
              className={cn(
                "flex-1 h-12 rounded-xl text-white font-bold",
                isIncome
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-rose-600 hover:bg-rose-700",
              )}
              onClick={handleSave}
              disabled={isSaveDisabled}
            >
              {isPending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : isEditing ? (
                "Salvar Alterações"
              ) : (
                "Salvar"
              )}
            </Button>
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}
