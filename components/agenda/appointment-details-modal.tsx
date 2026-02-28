"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MessageCircle,
  Clock,
  CalendarDays,
  User,
  Repeat,
  CalendarX2,
  CalendarClock,
} from "lucide-react";
import { toast } from "sonner";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Usamos um 'any' temporário aqui só para moldar o visual, depois tipamos com o Prisma
  appointment: any | null;
}

export function AppointmentDetailsModal({
  open,
  onOpenChange,
  appointment,
}: AppointmentDetailsModalProps) {
  if (!appointment) return null;

  // Lógica inteligente do WhatsApp
  const handleWhatsApp = () => {
    const firstName = appointment.clientName.split(" ")[0];
    let message = "";

    // Verifica pelo texto se é a última sessão do pacote (Ex: "Sessão 5 de 5")
    const isLastSession = appointment.sessionInfo?.match(/Sessão (\d+) de \1/i);

    if (isLastSession) {
      message = `Olá ${firstName}! 🎉 Passando para lembrar que hoje às ${appointment.time} temos a nossa última massagem do pacote! Te espero lá. 💆‍♀️✨`;
    } else {
      message = `Olá ${firstName}! Passando para confirmar nossa sessão amanhã às ${appointment.time}. Podemos confirmar? 💆‍♀️✨`;
    }

    window.open(
      `https://wa.me/${appointment.phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    toast.success("Abrindo o WhatsApp...");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader className="mb-2">
          <div className="flex items-center justify-between pr-6">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              {appointment.clientName}
            </DialogTitle>
            {appointment.isRecurring && (
              <Badge
                variant="secondary"
                className="bg-primary/10 text-primary border-primary/20 flex items-center gap-1"
              >
                <Repeat className="h-3 w-3" /> Pacote
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground font-medium text-sm mt-1">
            {appointment.service}
          </p>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Card de Informações de Tempo */}
          <div className="bg-muted/30 border border-border/50 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Data a definir (Hoje)</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {appointment.time}{" "}
                <span className="text-muted-foreground font-normal">
                  ({appointment.duration} min)
                </span>
              </span>
            </div>

            <div className="h-px bg-border/50 w-full my-1" />

            <div className="flex justify-between items-center">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Status da Sessão
              </span>
              <Badge variant="outline" className="font-bold">
                {appointment.sessionInfo}
              </Badge>
            </div>
          </div>

          {/* Botão de Ação Principal (WhatsApp) */}
          <Button
            className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-sm h-12 rounded-xl text-base"
            onClick={handleWhatsApp}
          >
            <MessageCircle className="mr-2 h-5 w-5" />
            Confirmar via WhatsApp
          </Button>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 mt-4">
          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 w-full sm:w-auto"
            onClick={() => onOpenChange(false)}
          >
            <CalendarX2 className="mr-2 h-4 w-4" />
            Cancelar Sessão
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => {
              toast.info(
                "Abre o modal de reagendamento e pergunta se altera todo o pacote.",
              );
              onOpenChange(false);
            }}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            Remarcar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
