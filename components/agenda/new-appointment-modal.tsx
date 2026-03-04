"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  CalendarClock,
  Repeat,
  Calendar as CalendarIcon,
  Clock,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { createAppointment } from "@/app/actions/appointments";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /**
   * Organização atual do Admin (id da Organization).
   * Idealmente vem da sessão/autenticação.
   */
  organizationId: string;
  /**
   * Callback opcional para o pai recarregar a agenda
   * depois de salvar um agendamento novo.
   */
  onCreated?: () => void;
}

// Tipos simples para listar clientes e serviços
type ClientOption = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
};

// Gera os horários de 30 em 30 minutos (08:00 até 19:00)
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function NewAppointmentModal({
  open,
  onOpenChange,
  organizationId,
  onCreated,
}: NewAppointmentModalProps) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>(undefined);
  const [sessions, setSessions] = useState(5);

  const [clients, setClients] = useState<ClientOption[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    undefined,
  );
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >(undefined);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const incrementSessions = () => setSessions((prev) => prev + 1);
  const decrementSessions = () =>
    setSessions((prev) => (prev > 2 ? prev - 1 : 2));

  // Carrega lista básica de clientes e serviços da organização
  useEffect(() => {
    async function loadOptions() {
      if (!open || !organizationId) return;

      setLoadingOptions(true);
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch(`/api/admin/clients?organizationId=${organizationId}`),
          fetch(`/api/admin/services?organizationId=${organizationId}`),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(
            (data.clients ?? []).map((c: any) => ({
              id: c.id,
              name: c.name,
            })),
          );
        } else {
          console.error("Falha ao carregar clientes");
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(
            (data.services ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
            })),
          );
        } else {
          console.error("Falha ao carregar serviços");
        }
      } catch (error) {
        console.error("Erro ao carregar opções de cliente/serviço:", error);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [open, organizationId]);

  const handleSave = async () => {
    if (!organizationId) {
      toast.error("Organização não definida.");
      return;
    }
    if (!selectedClientId) {
      toast.error("Selecione uma cliente.");
      return;
    }
    if (!selectedServiceId) {
      toast.error("Selecione um serviço.");
      return;
    }
    if (!date) {
      toast.error("Selecione a data da sessão.");
      return;
    }
    if (!time) {
      toast.error("Selecione o horário.");
      return;
    }

    // Monta o DateTime combinando data + horário
    const [hourStr, minuteStr] = time.split(":");
    const fullDateTime = new Date(date);
    fullDateTime.setHours(Number(hourStr), Number(minuteStr), 0, 0);

    setSaving(true);
    try {
      const result = await createAppointment({
        organizationId,
        clientId: selectedClientId,
        serviceId: selectedServiceId,
        dateTime: fullDateTime,
        // No futuro: passar packageId, se for um pacote real selecionado
      });

      if (!result.success) {
        toast.error(result.error || "Erro ao salvar agendamento.");
        return;
      }

      const count = result.appointments.length;
      toast.success(
        count > 1
          ? `${count} sessões foram agendadas com sucesso!`
          : "Agendamento criado com sucesso!",
      );

      onOpenChange(false);
      // Notifica o pai para recarregar a agenda do dia
      onCreated?.();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      toast.error("Erro inesperado ao salvar agendamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Marque um horário avulso ou inicie um pacote recorrente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
          {/* Seleção de Cliente */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="client">Cliente</Label>
            <Select
              disabled={loadingOptions}
              value={selectedClientId}
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger id="client" className="bg-background">
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Carregando clientes..."
                      : "Selecione a cliente..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Serviço */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="service">Serviço ou Pacote</Label>
            <Select
              disabled={loadingOptions}
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger id="service" className="bg-background">
                <SelectValue
                  placeholder={
                    loadingOptions
                      ? "Carregando serviços..."
                      : "Selecione o serviço..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Data e Hora (Componentes Customizados) */}
          <div className="grid grid-cols-2 gap-4">
            {/* DatePicker Customizado */}
            <div className="flex flex-col gap-2">
              <Label>Data da 1ª Sessão</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal bg-background",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                    {date ? format(date, "dd/MM/yyyy") : <span>Selecione</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* TimePicker Customizado */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Horário</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger id="time" className="bg-background">
                  <Clock className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="max-h-50">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="h-px bg-border/50 my-1" />

          {/* A Mágica da Recorrência */}
          <div className="flex flex-col gap-4 bg-muted/30 p-3.5 rounded-xl border border-border/50 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <Label
                  className="flex items-center gap-2 text-foreground font-semibold cursor-pointer"
                  onClick={() => setIsRecurring(!isRecurring)}
                >
                  <div
                    className={cn(
                      "p-1 rounded-md transition-colors",
                      isRecurring
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    <Repeat className="h-3.5 w-3.5" />
                  </div>
                  Repetir semanalmente?
                </Label>
                <span className="text-[11px] text-muted-foreground">
                  Ideal para pacotes fixos.
                </span>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {/* Input Numérico Customizado */}
            {isRecurring && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-border/50 mt-1">
                <div className="flex items-center justify-between">
                  <Label>Quantidade de sessões</Label>

                  <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-0.5 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-muted"
                      onClick={decrementSessions}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    <Input
                      value={sessions}
                      onChange={(e) => setSessions(Number(e.target.value))}
                      className="h-7 w-12 border-0 bg-transparent text-center font-bold text-sm focus-visible:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-muted"
                      onClick={incrementSessions}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground bg-background/50 p-2 rounded-md border border-border/30">
                  A cliente será agendada para{" "}
                  <strong>{sessions} semanas</strong> seguidas, sempre neste
                  mesmo horário.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button onClick={handleSave} className="shadow-sm" disabled={saving}>
            {saving ? "Salvando..." : "Salvar Agendamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
