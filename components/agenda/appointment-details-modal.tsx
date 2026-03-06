"use client";

import { useState, useEffect, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageCircle,
  Clock,
  CalendarDays,
  User,
  CalendarX2,
  ReceiptText,
  AlertCircle,
  Trash2,
  Save,
  Loader2,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  updateAppointment,
  deleteAppointment,
} from "@/app/actions/appointments";
import { ThermalReceipt } from "./thermal-receipt";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
  onRefresh?: () => void;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
  onRefresh,
}: AppointmentDetailsModalProps) {
  const [status, setStatus] = useState("a_confirmar");
  const [payment, setPayment] = useState("nenhum");
  const [obs, setObs] = useState("");
  const [hasCharge, setHasCharge] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<any>(null);

  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Recibo_${appointment?.clientName || "Cliente"}`,
  });

  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings/public");
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (e) {
        console.error("Erro ao carregar settings", e);
      }
    }
    if (open) loadSettings();
  }, [open]);

  useEffect(() => {
    if (appointment) {
      const dbStatus = appointment.status?.toLowerCase();
      // Mapeia o que vem do banco para o valor do Select
      const mappedStatus =
        dbStatus === "pendente"
          ? "a_confirmar"
          : dbStatus === "cancelado"
            ? "cancelado"
            : dbStatus || "a_confirmar";

      setStatus(mappedStatus);
      setPayment(appointment.paymentMethod?.toLowerCase() || "nenhum");
      setObs(appointment.observations || "");
      setHasCharge(appointment.hasCharge ?? false);
    }
  }, [appointment]);

  // 🔥 REGRA DE NEGÓCIO EM TEMPO REAL: Se houver pagamento ou realizado, sugere tirar a cobrança
  useEffect(() => {
    if (
      (status === "realizado" && payment !== "nenhum") ||
      status === "cancelado"
    ) {
      setHasCharge(false);
    }
  }, [status, payment]);

  if (!appointment) return null;

  const handleSave = async (overriddenStatus?: string) => {
    setIsSaving(true);
    try {
      const targetStatus = overriddenStatus || status;
      const result = await updateAppointment(appointment.id, {
        status: targetStatus,
        paymentMethod: payment,
        observations: obs,
        hasCharge: targetStatus === "cancelado" ? false : hasCharge,
      });

      if (result.success) {
        toast.success(
          targetStatus === "cancelado"
            ? "Sessão cancelada!"
            : "Alterações salvas!",
        );
        onRefresh?.();
        onOpenChange(false);
      } else {
        toast.error("Erro ao salvar.");
      }
    } catch (error) {
      toast.error("Erro inesperado.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await deleteAppointment(appointment.id);
      if (result.success) {
        toast.success("Agendamento excluído definitivamente.");
        onRefresh?.();
        onOpenChange(false);
      }
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "w-[95vw] sm:max-w-125 p-4 sm:p-6 rounded-2xl flex flex-col max-h-[90dvh]",
          hasCharge ? "border-2 border-destructive shadow-lg" : "",
        )}
      >
        <ThermalReceipt
          ref={componentRef}
          appointment={appointment}
          settings={settings}
        />

        <DialogHeader className="flex flex-row justify-between items-start">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {appointment.clientName}
            </DialogTitle>
            <span className="text-muted-foreground text-sm">
              {appointment.service}
            </span>
          </div>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir permanentemente?</AlertDialogTitle>
                <AlertDialogDescription>
                  Isso apagará o registro do banco. Para manter o histórico, use
                  o botão "Cancelar Sessão".
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Voltar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-white rounded-xl"
                >
                  Sim, Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto py-2">
          <div className="bg-muted/30 p-3 rounded-xl flex flex-col gap-2">
            <div className="flex justify-between items-center text-sm font-medium">
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" /> Atendimento
              </div>
              <Badge
                variant={status === "cancelado" ? "destructive" : "outline"}
                className="rounded-lg"
              >
                {status === "cancelado"
                  ? "Cancelado"
                  : appointment.sessionInfo || "Avulso"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Clock className="h-4 w-4 text-muted-foreground" />
              {appointment.time} às{" "}
              {calculateEndTime(appointment.time, appointment.duration)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Status do Atendimento</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  className={cn(
                    status === "confirmado" &&
                      "bg-emerald-50 border-emerald-200 text-emerald-700",
                    status === "realizado" &&
                      "bg-blue-50 border-blue-200 text-blue-700",
                    status === "cancelado" &&
                      "bg-destructive/10 border-destructive/20 text-destructive",
                    "rounded-xl",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_confirmar">A Confirmar</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="nao_compareceu">Não Compareceu</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold">Forma de Pagamento</Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Aguardando...</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Observações Internas</Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Ex: Cliente prefere massagem mais forte nas costas..."
              className="bg-muted/20 resize-none h-20 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={hasCharge ? "destructive" : "outline"}
              className="rounded-xl"
              onClick={() => setHasCharge(!hasCharge)}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {hasCharge ? "Cobrança Ativa" : "Sem Pendência"}
            </Button>

            <Button
              variant="secondary"
              className="bg-primary/10 text-primary hover:bg-primary/20 font-bold rounded-xl"
              onClick={() => {
                handlePrint();
                toast.success("Gerando recibo...");
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Recibo
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t mt-auto">
          {status !== "cancelado" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive w-full sm:w-auto hover:bg-destructive/10 rounded-xl"
                >
                  <CalendarX2 className="mr-2 h-4 w-4" /> Cancelar Sessão
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Deseja cancelar este atendimento?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    O agendamento continuará na agenda com um traço de
                    cancelado, preservando seu histórico.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Voltar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleSave("cancelado")}
                    className="bg-destructive text-white rounded-xl"
                  >
                    Confirmar Cancelamento
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}

          <div className="flex-1" />

          <Button
            onClick={() => handleSave()}
            disabled={isSaving}
            className="w-full sm:w-auto bg-primary rounded-xl font-bold shadow-md"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
