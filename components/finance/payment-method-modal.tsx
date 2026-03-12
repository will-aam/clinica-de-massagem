// components/finance/payment-method-modal.tsx

"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { OrganizationPaymentMethod, PaymentMethod } from "@/types/finance";
import { Check, ChevronsUpDown, PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  method?: OrganizationPaymentMethod | null;
}

export function PaymentMethodModal({
  isOpen,
  onClose,
  method,
}: PaymentMethodModalProps) {
  const [selectedName, setSelectedName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [feePercentage, setFeePercentage] = useState<number | "">("");
  const [feeFixed, setFeeFixed] = useState<number | "">("");
  const [daysToReceive, setDaysToReceive] = useState<number | "">("");

  const [openCombobox, setOpenCombobox] = useState(false);
  const [search, setSearch] = useState("");

  const defaultNames = [
    "Pix",
    "Cartão de Crédito",
    "Cartão de Débito",
    "Dinheiro",
  ];
  const [customNames, setCustomNames] = useState<string[]>([]);

  const allNames = [...defaultNames, ...customNames];
  const filteredNames = allNames.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      if (method) {
        setSelectedName(method.name);
        setIsActive(method.isActive);
        setFeePercentage(method.feePercentage);
        setFeeFixed(method.feeFixed);
        setDaysToReceive(method.daysToReceive);

        if (
          !defaultNames.includes(method.name) &&
          !customNames.includes(method.name)
        ) {
          setCustomNames((prev) => [...prev, method.name]);
        }
      } else {
        setSelectedName("");
        setIsActive(true);
        setFeePercentage(0);
        setFeeFixed(0);
        setDaysToReceive(0);
      }
    }
  }, [isOpen, method]);

  const deriveBaseType = (name: string): PaymentMethod => {
    const lower = name.toLowerCase();
    if (lower.includes("pix")) return "PIX";
    if (lower.includes("crédito") || lower.includes("credito"))
      return "CREDIT_CARD";
    if (lower.includes("débito") || lower.includes("debito"))
      return "DEBIT_CARD";
    if (lower.includes("dinheiro") || lower.includes("espécie")) return "CASH";
    return "OTHER";
  };

  const handleSave = () => {
    if (!selectedName) return;

    const finalBaseType = deriveBaseType(selectedName);

    console.log("Salvar:", {
      name: selectedName,
      type: finalBaseType,
      isActive,
      feePercentage,
      feeFixed,
      daysToReceive,
    });

    onClose();
  };

  const handleClearSelection = () => {
    if (customNames.includes(selectedName)) {
      setCustomNames((prev) => prev.filter((n) => n !== selectedName));
    }
    setSelectedName("");
  };

  const isEditing = !!method;
  const isSaveDisabled = !selectedName;

  // Classe mágica do Tailwind para sumir com as setinhas dos inputs de número em todos os navegadores
  const hideNumberArrows =
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0 overflow-hidden">
        {/* Adicionámos as classes para esconder a barra de rolagem (Chrome, Safari, Firefox, Edge) */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <SheetHeader className="text-left">
            <SheetTitle>
              {isEditing ? "Editar Pagamento" : "Novo Pagamento"}
            </SheetTitle>
            <SheetDescription>
              Configure o meio de pagamento e as suas taxas.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-col gap-6 py-2">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border/50">
              <div className="space-y-0.5">
                <Label className="text-base font-semibold">
                  Status do Método
                </Label>
                <p className="text-xs text-muted-foreground">
                  Se desativado, não aparecerá na tela de vendas.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>

            <div className="space-y-2">
              <Label>
                Meio de Pagamento <span className="text-rose-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Popover
                  open={openCombobox}
                  onOpenChange={(open) => {
                    setOpenCombobox(open);
                    if (!open) setSearch("");
                  }}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={openCombobox}
                      className={cn(
                        "flex-1 justify-between h-12 rounded-xl text-left font-normal",
                        !selectedName && "text-muted-foreground",
                      )}
                    >
                      <span className="truncate">
                        {selectedName || "Selecione ou digite um novo..."}
                      </span>
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-[calc(100vw-3rem)] sm:w-87.5 p-0"
                    align="start"
                  >
                    <Command shouldFilter={false}>
                      <CommandInput
                        placeholder="Buscar ou digitar novo..."
                        value={search}
                        onValueChange={setSearch}
                      />
                      <CommandList>
                        <CommandGroup>
                          {filteredNames.map((name) => (
                            <CommandItem
                              key={name}
                              value={name}
                              onSelect={() => {
                                setSelectedName(name);
                                setOpenCombobox(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  selectedName === name
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              {name}
                            </CommandItem>
                          ))}

                          {search.length > 0 &&
                            !allNames.some(
                              (n) => n.toLowerCase() === search.toLowerCase(),
                            ) && (
                              <CommandItem
                                onSelect={() => {
                                  setCustomNames((prev) => [...prev, search]);
                                  setSelectedName(search);
                                  setSearch("");
                                  setOpenCombobox(false);
                                }}
                                className="text-primary font-medium cursor-pointer"
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Criar "{search}"
                              </CommandItem>
                            )}

                          {filteredNames.length === 0 &&
                            search.length === 0 && (
                              <div className="p-4 text-sm text-center text-muted-foreground">
                                Digite algo para criar.
                              </div>
                            )}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Button
                  variant="outline"
                  size="icon"
                  disabled={!selectedName}
                  onClick={handleClearSelection}
                  className="h-12 w-12 shrink-0 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                  title="Limpar seleção"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Taxa (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={feePercentage}
                    onChange={(e) => setFeePercentage(Number(e.target.value))}
                    className={cn("h-12 rounded-xl pr-8", hideNumberArrows)}
                    placeholder="0.00"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    %
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Taxa Fixa (R$)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    R$
                  </span>
                  <Input
                    type="number"
                    value={feeFixed}
                    onChange={(e) => setFeeFixed(Number(e.target.value))}
                    className={cn("h-12 rounded-xl pl-8", hideNumberArrows)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dias para receber</Label>
              <Input
                type="number"
                value={daysToReceive}
                onChange={(e) => setDaysToReceive(Number(e.target.value))}
                className={cn("h-12 rounded-xl", hideNumberArrows)}
                placeholder="0 (na hora) ou ex: 30"
              />
              <p className="text-[11px] text-muted-foreground">
                Coloque 0 se o dinheiro cai na mesma hora (ex: Pix/Dinheiro).
              </p>
            </div>
          </div>
        </div>

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
              className="flex-1 h-12 rounded-xl"
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
