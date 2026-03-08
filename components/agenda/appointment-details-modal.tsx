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
  Clock,
  CalendarDays,
  User,
  CalendarX2,
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
        console.error(e);
      }
    }
    if (open) loadSettings();
  }, [open]);

  // Sincroniza dados quando o modal abre
  useEffect(() => {
    if (appointment) {
      const dbStatus = appointment.status?.toLowerCase();
      setStatus(
        dbStatus === "pendente" ? "a_confirmar" : dbStatus || "a_confirmar",
      );

      const currentPayment =
        appointment.paymentMethod?.toLowerCase() ||
        appointment.payment_method?.toLowerCase() ||
        "nenhum";
      setPayment(currentPayment);

      setObs(appointment.observations || "");
      setHasCharge(appointment.hasCharge ?? appointment.has_charge ?? false);
    }
  }, [appointment]);

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
        toast.success("Dados salvos com sucesso!");
        onRefresh?.();
        onOpenChange(false);
      } else {
        toast.error("Erro ao salvar.");
      }
    } catch (error) {
      toast.error("Erro na conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteAppointment(appointment.id);
      toast.success("Agendamento excluído!");
      onRefresh?.();
      onOpenChange(false);
    } catch (error) {
      toast.error("Erro ao excluir agendamento.");
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
          "w-[95vw] sm:max-w-125 p-4 sm:p-6 rounded-2xl flex flex-col max-h-[90dvh] [&>button]:hidden",
          hasCharge ? "border-2 border-destructive shadow-lg" : "",
        )}
      >
        <ThermalReceipt
          ref={componentRef}
          appointment={{
            ...appointment,
            observations: obs,
            price: appointment.price,
          }}
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

          {/* 🔥 AlertDialog (Shadcn) substituindo o confirm() nativo do topo */}
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
                  Isso apagará este agendamento do banco de dados e não deixará
                  histórico. Para manter o histórico, use o botão "Cancelar
                  Sessão" abaixo.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">
                  Cancelar
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
                >
                  Sim, excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DialogHeader>

        <div className="flex flex-col gap-4 overflow-y-auto py-2 pr-1">
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
            <div className="text-sm font-semibold">
              {appointment.time} às{" "}
              {calculateEndTime(appointment.time, appointment.duration)}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a_confirmar">A Confirmar</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="realizado">Realizado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold uppercase">Pagamento</Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Aguardando...</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Débito</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-primary">
              Observações do Recibo
            </Label>
            <Textarea
              value={obs}
              onChange={(e) => setObs(e.target.value)}
              placeholder="Digite detalhes que aparecerão no recibo..."
              className="bg-muted/20 resize-none h-20 rounded-xl"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant={hasCharge ? "destructive" : "outline"}
              className="rounded-xl"
              onClick={() => setHasCharge(!hasCharge)}
              disabled={status === "realizado"}
            >
              {hasCharge ? "Cobrança Ativa" : "Tudo Pago"}
            </Button>

            <Button
              variant="secondary"
              className="bg-primary/10 text-primary font-bold rounded-xl"
              onClick={() => {
                handlePrint();
                toast.success("Imprimindo...");
              }}
            >
              <Printer className="mr-2 h-4 w-4" /> Recibo
            </Button>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-4 border-t mt-auto">
          {status !== "realizado" && status !== "cancelado" && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="text-destructive w-full sm:w-auto rounded-xl"
                >
                  <CalendarX2 className="mr-2 h-4 w-4" /> Cancelar Sessão
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl">
                <AlertDialogHeader>
                  <AlertDialogTitle>Deseja cancelar?</AlertDialogTitle>
                  <AlertDialogDescription>
                    O histórico será mantido com um traço de cancelado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-xl">
                    Sair
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleSave("cancelado")}
                    className="bg-destructive hover:bg-destructive/90 text-white rounded-xl"
                  >
                    Confirmar
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
