"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Clock, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ScheduleSettings = {
  openingTime: string; // "08:00"
  closingTime: string; // "19:00"
};

interface ScheduleSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialSettings: ScheduleSettings;
  onSave: (settings: ScheduleSettings) => void;
  onClearToday?: (deletedCount: number) => void;
}

// Gera slots de hora cheia: 00:00, 01:00, ..., 23:00
const HOUR_SLOTS = Array.from(
  { length: 24 },
  (_, i) => `${String(i).padStart(2, "0")}:00`,
);

export function ScheduleSettingsModal({
  open,
  onOpenChange,
  initialSettings,
  onSave,
  onClearToday,
}: ScheduleSettingsModalProps) {
  const [openingTime, setOpeningTime] = useState(initialSettings.openingTime);
  const [closingTime, setClosingTime] = useState(initialSettings.closingTime);

  const [clearPassword, setClearPassword] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  useEffect(() => {
    if (!open) {
      setClearPassword("");
      setIsClearDialogOpen(false);
    }
  }, [open]);

  const handleConfirm = () => {
    // Garantia simples: não deixar fechamento antes da abertura
    if (closingTime <= openingTime) {
      // você pode trocar por um toast se quiser
      alert("O horário de fechamento deve ser depois do horário de abertura.");
      return;
    }

    onSave({ openingTime, closingTime });
    onOpenChange(false);
  };

  const handleClearToday = async () => {
    if (!clearPassword) {
      toast.error("Digite sua senha para confirmar.");
      return;
    }

    setIsClearing(true);
    try {
      const res = await fetch("/api/admin/agenda/clear-today", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: clearPassword }),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error || "Erro ao limpar agenda.");
      }

      const data = await res.json();
      toast.success(`Agenda de hoje limpa (${data.deleted ?? 0}).`);
      setClearPassword("");
      setIsClearDialogOpen(false);
      onClearToday?.(data.deleted ?? 0);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Erro ao limpar.");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configurar Horário da Agenda</DialogTitle>
          <DialogDescription>
            Defina o horário de funcionamento diário. A agenda e os horários
            disponíveis para novos agendamentos seguirão essa faixa.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Horário de abertura */}
          <div className="flex flex-col gap-2">
            <Label>Início do expediente</Label>
            <Select value={openingTime} onValueChange={setOpeningTime}>
              <SelectTrigger className="bg-background">
                <Clock className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {HOUR_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Horário de fechamento */}
          <div className="flex flex-col gap-2">
            <Label>Fim do expediente</Label>
            <Select value={closingTime} onValueChange={setClosingTime}>
              <SelectTrigger className="bg-background">
                <Clock className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {HOUR_SLOTS.map((slot) => (
                  <SelectItem key={slot} value={slot}>
                    {slot}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Ação destrutiva */}
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-3">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-destructive">
                  Limpar agenda de hoje
                </p>
                <p className="text-xs text-muted-foreground">
                  Remove todos os agendamentos de hoje (com confirmação).
                </p>
              </div>

              <AlertDialog
                open={isClearDialogOpen}
                onOpenChange={setIsClearDialogOpen}
              >
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Limpar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmar limpeza</AlertDialogTitle>
                    <AlertDialogDescription>
                      Digite sua senha para limpar todos os agendamentos de
                      hoje.
                    </AlertDialogDescription>
                  </AlertDialogHeader>

                  <div className="mt-3">
                    <Label>Senha do administrador</Label>
                    <Input
                      type="password"
                      value={clearPassword}
                      onChange={(e) => setClearPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-2"
                    />
                  </div>

                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearToday}
                      disabled={isClearing}
                      className="bg-destructive text-white"
                    >
                      {isClearing ? "Limpando..." : "Confirmar"}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
