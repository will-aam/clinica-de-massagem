"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
} from "lucide-react";

// Importando os nossos novos componentes modulares!
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
    hasCharge: true, // <-- ADICIONADO AQUI PARA TESTARMOS O ALARME VERMELHO!
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
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- CONTROLES DE ESTADO DOS MODAIS ---
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  // Formatação simples do dia de hoje (Ex: "Terça-feira, 14 de Mar")
  const formattedDate = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "short",
  })
    .format(currentDate)
    .replace(/^\w/, (c) => c.toUpperCase());

  // Ação ao clicar no card da grade
  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
  };

  return (
    <>
      <AdminHeader title="Agenda Diária" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
        {/* CABEÇALHO DA AGENDA (Navegação de Dias) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CalendarIcon className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                {formattedDate}
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                Você tem {MOCK_APPOINTMENTS.length} agendamentos hoje.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center bg-muted/50 rounded-full border border-border/50 p-1">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-semibold px-4 text-foreground">
                Hoje
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            {/* BOTÃO NOVO QUE ABRE O MODAL */}
            <Button
              className="rounded-full shadow-sm shrink-0"
              onClick={() => setIsNewModalOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" />
              Novo
            </Button>
          </div>
        </div>

        {/* --- A GRADE DA AGENDA --- */}
        {/* Olha como o código ficou limpo! Todo aquele HTML virou 1 linha */}
        <DailyAgendaGrid
          appointments={MOCK_APPOINTMENTS}
          onAppointmentClick={handleAppointmentClick}
        />
      </div>

      {/* --- OS MODAIS (Ficam invisíveis até serem chamados) --- */}

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
