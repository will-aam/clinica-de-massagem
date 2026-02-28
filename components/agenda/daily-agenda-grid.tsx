"use client";

import { Button } from "@/components/ui/button";
import { MessageCircle, Repeat, Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// --- CONFIGURAÇÕES DA NOSSA GRADE ---
const START_HOUR = 8; // Começa às 08:00
const END_HOUR = 19; // Termina às 19:00
const HOUR_HEIGHT = 96; // h-24 no tailwind

const HOURS = Array.from(
  { length: END_HOUR - START_HOUR + 1 },
  (_, i) => i + START_HOUR,
);

// Interface para o TypeScript saber o que é um Agendamento
export interface Appointment {
  id: string;
  time: string;
  duration: number;
  clientName: string;
  service: string;
  sessionInfo: string;
  isRecurring: boolean;
  phone: string;
  color: string;
  hasCharge?: boolean; // Novo campo de cobrança!
}

interface DailyAgendaGridProps {
  appointments: Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
}

export function DailyAgendaGrid({
  appointments,
  onAppointmentClick,
}: DailyAgendaGridProps) {
  // Calcula a posição do bloco na tela (Top e Height)
  const calculatePosition = (timeStr: string, durationMinutes: number) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const timeInMinutes = hours * 60 + minutes;
    const startOffsetMinutes = START_HOUR * 60;

    const top = ((timeInMinutes - startOffsetMinutes) / 60) * HOUR_HEIGHT;
    const height = (durationMinutes / 60) * HOUR_HEIGHT;

    return { top, height };
  };

  // Calcula hora de término para exibir no card
  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m + duration);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  // Botão rápido do WhatsApp direto no card
  const handleConfirmWhatsApp = (e: React.MouseEvent, appt: Appointment) => {
    e.stopPropagation(); // Impede que o clique no botão abra o modal de detalhes

    const firstName = appt.clientName.split(" ")[0];
    const isLastSession = appt.sessionInfo?.match(/Sessão (\d+) de \1/i);

    let message = isLastSession
      ? `Olá ${firstName}! 🎉 Hoje às ${appt.time} finalizamos seu pacote de massagem! Te espero lá. 💆‍♀️✨`
      : `Olá ${firstName}! Passando para confirmar nossa sessão amanhã às ${appt.time}. Podemos confirmar? 💆‍♀️✨`;

    window.open(
      `https://wa.me/${appt.phone}?text=${encodeURIComponent(message)}`,
      "_blank",
    );
    toast.success("Redirecionado para o WhatsApp!");
  };

  return (
    <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden flex flex-col">
      <div className="overflow-y-auto max-h-150 relative w-full scroll-smooth">
        <div className="flex relative min-w-150">
          {/* COLUNA ESQUERDA: Linha do Tempo (Horas) */}
          <div className="w-20 shrink-0 border-r border-border/50 bg-muted/10 relative z-20">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="h-24 relative flex justify-center border-b border-border/30 last:border-0"
              >
                <span className="absolute -top-3 bg-card px-1 text-xs font-semibold text-muted-foreground">
                  {hour.toString().padStart(2, "0")}:00
                </span>
              </div>
            ))}
          </div>

          {/* COLUNA DIREITA: Grade e Cards */}
          <div className="flex-1 relative bg-grid-pattern">
            {/* Linhas de fundo */}
            {HOURS.map((hour) => (
              <div
                key={`grid-${hour}`}
                className="h-24 border-b border-border/30 w-full"
              />
            ))}

            {/* Renderização dos Blocos de Agendamento */}
            <div className="absolute top-0 left-0 right-0 bottom-0 p-2">
              {appointments.map((appt) => {
                const { top, height } = calculatePosition(
                  appt.time,
                  appt.duration,
                );

                return (
                  <div
                    key={appt.id}
                    onClick={() => onAppointmentClick(appt)} // Abre o Modal de Detalhes
                    className={cn(
                      "absolute left-2 right-4 ml-1 md:ml-4 rounded-xl border p-3 flex flex-col shadow-sm transition-all hover:scale-[1.01] hover:shadow-md cursor-pointer group overflow-hidden",
                      appt.color,
                      // Se tem cobrança, adiciona a borda vermelha e um glow suave
                      appt.hasCharge &&
                        "border-2 border-destructive shadow-[0_0_10px_rgba(239,68,68,0.3)] ring-1 ring-destructive/50",
                    )}
                    style={{
                      top: `${top}px`,
                      height: `${height}px`,
                      zIndex: 10,
                    }}
                  >
                    <div className="flex justify-between items-start w-full">
                      <div className="flex flex-col truncate pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm md:text-base leading-none truncate">
                            {appt.clientName}
                          </span>

                          {/* Ícones de Alerta / Recorrência */}
                          <div className="flex items-center gap-1">
                            {appt.isRecurring && (
                              <span title="Agendamento Recorrente">
                                <Repeat className="h-3 w-3 opacity-60" />
                              </span>
                            )}
                            {appt.hasCharge && (
                              <span
                                title="Cobrança Pendente"
                                className="text-destructive animate-pulse"
                              >
                                <AlertCircle className="h-3.5 w-3.5" />
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-xs font-medium opacity-80 mt-1.5 truncate">
                          {appt.service}
                        </span>
                      </div>

                      {/* Botão de WhatsApp embutido no bloco */}
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => handleConfirmWhatsApp(e, appt)}
                        className="h-8 w-8 rounded-full bg-white/40 hover:bg-white/80 text-emerald-700 shrink-0 shadow-sm transition-all"
                        title="Confirmar via WhatsApp"
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Rodapé: Agora mostra Início e Fim */}
                    <div className="mt-auto flex items-center gap-3 text-xs font-medium opacity-70 pt-2 border-t border-black/5">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appt.time} -{" "}
                        {calculateEndTime(appt.time, appt.duration)}
                      </span>
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/30 text-[10px] uppercase font-bold tracking-wider">
                        {appt.sessionInfo}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
