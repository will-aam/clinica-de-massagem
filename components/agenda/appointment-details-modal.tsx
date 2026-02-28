"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Repeat,
  CalendarX2,
  CalendarClock,
  ReceiptText,
  AlertCircle,
  Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any | null;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailsModalProps) {
  // Estados para controlar os novos campos que você pediu!
  const [status, setStatus] = useState("a_confirmar");
  const [payment, setPayment] = useState("nenhum");
  const [obs, setObs] = useState("");
  const [hasCharge, setHasCharge] = useState(false); // A famosa "Cobrança" (borda vermelha)

  // Quando abrir um agendamento diferente, reseta os dados
  useEffect(() => {
    if (appointment) {
      setStatus(appointment.status || "a_confirmar");
      setPayment(appointment.payment || "nenhum");
      setObs(appointment.obs || "");
      setHasCharge(appointment.hasCharge || false);
    }
  }, [appointment]);

  if (!appointment) return null;

  // Calcula hora de término para ficar mais legível
  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const handleWhatsApp = () => {
    const firstName = appointment.clientName.split(" ")[0];
    const isLastSession = appointment.sessionInfo?.match(/Sessão (\d+) de \1/i);
    const message = isLastSession
      ? `Olá ${firstName}! 🎉 Passando para lembrar que hoje às ${appointment.time} temos a nossa última massagem do pacote! Te espero lá. 💆‍♀️✨`
      : `Olá ${firstName}! Passando para confirmar nossa sessão amanhã às ${appointment.time}. Podemos confirmar? 💆‍♀️✨`;

    window.open(
      `https://wa.me/${appointment.phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    toast.success("Abrindo o WhatsApp...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "sm:max-w-125 transition-colors duration-300",
          hasCharge
            ? "border-2 border-destructive shadow-[0_0_15px_rgba(239,68,68,0.1)]"
            : "",
        )}
      >
        <DialogHeader className="mb-2">
          <div className="flex items-start justify-between pr-6">
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {appointment.clientName}
                {hasCharge && (
                  <Badge
                    variant="destructive"
                    className="ml-2 text-[10px] animate-pulse"
                  >
                    Pendente
                  </Badge>
                )}
              </DialogTitle>
              <p className="text-muted-foreground font-medium text-sm flex items-center gap-2">
                {appointment.service}
                {appointment.isRecurring && (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1 h-5 text-[10px]"
                  >
                    <Repeat className="h-3 w-3" /> Pacote
                  </Badge>
                )}
              </p>
            </div>

            {/* Botão de Editar Rápido */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
            >
              <Pencil className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-5 py-2 overflow-y-auto max-h-[60vh] pr-2 [&::-webkit-scrollbar]:hidden">
          {/* Card de Tempo (Agora mostrando Início e Fim) */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-foreground">
                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Hoje</span>
              </div>
              <Badge variant="outline" className="font-bold bg-background">
                {appointment.sessionInfo}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.time} até{" "}
                {calculateEndTime(appointment.time, appointment.duration)}
                <span className="text-muted-foreground font-normal ml-1">
                  ({appointment.duration} min)
                </span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Status do Agendamento */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Status do Agendamento
              </Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger
                  className={cn(
                    "h-9",
                    status === "confirmado"
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold"
                      : "",
                  )}
                >
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  <SelectItem value="a_confirmar">A Confirmar</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="atrasou">Atrasou</SelectItem>
                  <SelectItem value="não_comparecimento">
                    Não Comparecimento
                  </SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Forma de Pagamento */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-muted-foreground">
                Forma de Pagamento
              </Label>
              <Select value={payment} onValueChange={setPayment}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informado</SelectItem>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">
                    Cartão de Crédito
                  </SelectItem>
                  <SelectItem value="cartao_debito">
                    Cartão de Débito
                  </SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observações */}
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">Observações</Label>
            <Textarea
              placeholder="Ex: Cliente tem alergia a óleo de amêndoas..."
              className="resize-none min-h-20 bg-muted/20"
              value={obs}
              onChange={(e) => setObs(e.target.value)}
            />
          </div>

          {/* Botões de Ação Dinâmicos */}
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button
              variant={hasCharge ? "destructive" : "outline"}
              className={cn(
                "w-full h-10",
                !hasCharge &&
                  "border-dashed border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive",
              )}
              onClick={() => setHasCharge(!hasCharge)}
            >
              <AlertCircle className="mr-2 h-4 w-4" />
              {hasCharge ? "Remover Cobrança" : "Adicionar Cobrança"}
            </Button>

            <Button
              variant="secondary"
              className="w-full h-10 bg-primary/10 text-primary hover:bg-primary/20"
            >
              <ReceiptText className="mr-2 h-4 w-4" />
              Gerar Recibo
            </Button>
          </div>

          <Button
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm h-11 text-sm mt-2"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Confirmar via WhatsApp
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-2 pt-4 border-t border-border/50">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            <CalendarX2 className="mr-2 h-4 w-4" /> Cancelar Sessão
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              toast.info("Modo de edição/remarcação ativado.");
              onOpenChange(false);
            }}
          >
            <CalendarClock className="mr-2 h-4 w-4" /> Remarcar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
