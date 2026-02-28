// app/admin/agenda/page.tsx
"use client";

import { useState } from "react";
import { format, startOfWeek, addDays, subDays, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

// Importando os nossos componentes
import {
  DailyAgendaGrid,
  Appointment,
} from "@/components/agenda/daily-agenda-grid";
import { NewAppointmentModal } from "@/components/agenda/new-appointment-modal";
import { AppointmentDetailsModal } from "@/components/agenda/appointment-details-modal";

// --- DADOS FALSOS (MOCKS) ---
const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: "1",
    time: "08:00",
    duration: 60,
    clientName: "Leda Paula",
    service: "Drenagem Linfática",
    sessionInfo: "Sessão 4 de 10",
    isRecurring: true,
    phone: "5579999999999",
    color: "bg-emerald-100 border-emerald-300 text-emerald-900",
    hasCharge: true,
  },
  {
    id: "2",
    time: "09:30",
    duration: 60,
    clientName: "Mariana Costa",
    service: "Massagem Relaxante",
    sessionInfo: "Avulsa",
    isRecurring: false,
    phone: "5579999999999",
    color: "bg-blue-100 border-blue-300 text-blue-900",
  },
  {
    id: "3",
    time: "14:00",
    duration: 90,
    clientName: "Camila Silva",
    service: "Projeto Verão (Combo)",
    sessionInfo: "Sessão 2 de 5",
    isRecurring: true,
    phone: "5579999999999",
    color: "bg-rose-100 border-rose-300 text-rose-900",
  },
];

export default function AgendaPage() {
  // Estado da data SELECIONADA (aquela que mostra a grade)
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Estado da semana VISÍVEL na "Tira da Semana" (começa no domingo da data atual)
  const [weekStart, setWeekStart] = useState(
    startOfWeek(new Date(), { weekStartsOn: 0 }),
  );

  // Controles dos Modais
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Formatação Responsiva do Dia
  // Desktop: "Sábado, 28 Fev"
  const formattedDateDesktop = format(selectedDate, "EEEE, dd MMM", {
    locale: ptBR,
  })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace("-feira", "");

  // Mobile: "Sáb, 28 Fev"
  const formattedDateMobile = format(selectedDate, "EEE, dd MMM", {
    locale: ptBR,
  })
    .replace(/^\w/, (c) => c.toUpperCase())
    .replace(".", "");

  // Gera os 7 dias da semana a partir do domingo atual visível
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Funções para navegar semanas inteiras
  const nextWeek = () => setWeekStart(addDays(weekStart, 7));
  const prevWeek = () => setWeekStart(subDays(weekStart, 7));

  return (
    <>
      <AdminHeader title="Agenda Diária" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
        {/* CABEÇALHO DA AGENDA (Navegação Inteligente) */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6 border-b border-border/50 pb-6">
          {/* LADO ESQUERDO: Título Clicável que abre o Calendário Mensal */}
          <Popover>
            <PopoverTrigger asChild>
              <div className="flex items-center gap-3 sm:gap-4 cursor-pointer hover:bg-muted/50 p-2 -ml-2 rounded-2xl transition-colors group w-fit">
                <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
                  <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
                <div className="text-left">
                  {/* Troca o texto dinamicamente dependendo do tamanho da tela */}
                  <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-foreground leading-tight flex items-center gap-2">
                    <span className="hidden sm:inline-block">
                      {formattedDateDesktop}
                    </span>
                    <span className="sm:hidden">{formattedDateMobile}</span>
                    <ChevronDown className="h-4 w-4 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                    Você tem {MOCK_APPOINTMENTS.length} agendamentos.
                  </p>
                </div>
              </div>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 rounded-2xl shadow-xl"
              align="start"
            >
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date);
                    setWeekStart(startOfWeek(date, { weekStartsOn: 0 }));
                  }
                }}
                initialFocus
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>

          {/* LADO DIREITO: Tira da Semana (Week Strip) e Botão Novo */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full xl:w-auto">
            {/* Tira da Semana Arrastável (Abreviada e Otimizada) */}
            <div className="flex items-center w-full sm:w-auto justify-between sm:justify-center bg-muted/20 sm:bg-transparent rounded-2xl sm:rounded-none p-1 sm:p-0 border sm:border-0 border-border/50">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevWeek}
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>

              <div className="flex gap-1.5 overflow-x-auto no-scrollbar scroll-smooth snap-x py-1 px-1 max-w-[calc(100vw-110px)] sm:max-w-md [&::-webkit-scrollbar]:hidden">
                {weekDays.map((day) => {
                  const isSelected = isSameDay(day, selectedDate);
                  const isToday = isSameDay(day, new Date());

                  // Força apenas 3 letras (DOM, SEG, TER) e retira pontuações
                  const shortDayName = format(day, "EEE", { locale: ptBR })
                    .substring(0, 3)
                    .replace(".", "");

                  return (
                    <button
                      key={day.toISOString()}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "flex flex-col items-center justify-center h-12 w-10 sm:h-14 sm:w-12 rounded-xl sm:rounded-2xl border transition-all shrink-0 snap-center",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground shadow-md scale-105"
                          : isToday
                            ? "bg-primary/10 border-primary/20 text-primary"
                            : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-muted/50",
                      )}
                    >
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                        {shortDayName}
                      </span>
                      <span
                        className={cn(
                          "text-base sm:text-lg font-bold mt-0.5 leading-none",
                          isSelected
                            ? "text-primary-foreground"
                            : "text-foreground",
                        )}
                      >
                        {format(day, "dd")}
                      </span>
                    </button>
                  );
                })}
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={nextWeek}
                className="shrink-0 h-8 w-8 sm:h-10 sm:w-10 rounded-full"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>

            {/* BOTÃO NOVO */}
            <Button
              className="rounded-xl sm:rounded-full shadow-sm shrink-0 w-full sm:w-auto h-12 sm:h-10 font-semibold"
              onClick={() => setIsNewModalOpen(true)}
            >
              <Plus className="h-4 w-4 sm:mr-1" />
              <span className="sm:inline">Novo</span>
            </Button>
          </div>
        </div>

        {/* --- A GRADE DA AGENDA --- */}
        <DailyAgendaGrid
          appointments={MOCK_APPOINTMENTS}
          onAppointmentClick={(appt) => setSelectedAppointment(appt)}
        />
      </div>

      {/* --- OS MODAIS --- */}
      <NewAppointmentModal
        open={isNewModalOpen}
        onOpenChange={setIsNewModalOpen}
      />

      <AppointmentDetailsModal
        open={!!selectedAppointment}
        onOpenChange={(open) => {
          if (!open) setSelectedAppointment(null);
        }}
        appointment={selectedAppointment}
      />
    </>
  );
}
