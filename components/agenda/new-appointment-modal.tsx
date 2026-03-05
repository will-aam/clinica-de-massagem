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
  onCreated?: () => void;
  openingTime?: string;
  closingTime?: string;
}

type ClientOption = {
  id: string;
  name: string;
};

type ServiceOption = {
  id: string;
  name: string;
};

type ActivePackage = {
  id: string;
  name: string;
  total_sessions: number;
  used_sessions: number;
};

function generateTimeSlots(openingTime: string, closingTime: string) {
  const [openH, openM] = openingTime.split(":").map(Number);
  const [closeH, closeM] = closingTime.split(":").map(Number);

  const slots: string[] = [];
  const current = new Date();
  current.setHours(openH, openM, 0, 0);

  const end = new Date();
  end.setHours(closeH, closeM, 0, 0);

  while (current <= end) {
    const h = String(current.getHours()).padStart(2, "0");
    const m = String(current.getMinutes()).padStart(2, "0");
    slots.push(`${h}:${m}`);
    current.setMinutes(current.getMinutes() + 30);
  }

  return slots;
}

export function NewAppointmentModal({
  open,
  onOpenChange,
  onCreated,
  openingTime = "08:00",
  closingTime = "19:00",
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

  const [activePackage, setActivePackage] = useState<ActivePackage | null>(
    null,
  );
  const [usePackage, setUsePackage] = useState(false);

  const [loadingOptions, setLoadingOptions] = useState(false);
  const [saving, setSaving] = useState(false);

  const TIME_SLOTS = generateTimeSlots(openingTime, closingTime);

  const incrementSessions = () => setSessions((prev) => prev + 1);
  const decrementSessions = () =>
    setSessions((prev) => (prev > 2 ? prev - 1 : 2));

  useEffect(() => {
    async function loadOptions() {
      if (!open) return;

      setLoadingOptions(true);
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/admin/services"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(
            (data.clients ?? []).map((c: any) => ({
              id: c.id,
              name: c.name,
            })),
          );
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(
            (data.services ?? []).map((s: any) => ({
              id: s.id,
              name: s.name,
            })),
          );
        }
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      } finally {
        setLoadingOptions(false);
      }
    }

    loadOptions();
  }, [open]);

  // Carrega pacote ativo quando cliente muda
  useEffect(() => {
    async function loadClientPackage() {
      if (!selectedClientId) {
        setActivePackage(null);
        setUsePackage(false);
        return;
      }

      try {
        const res = await fetch(`/api/clients/${selectedClientId}`);
        if (!res.ok) return;
        const data = await res.json();
        setActivePackage(data.activePackage || null);
      } catch (error) {
        console.error("Erro ao buscar pacote do cliente:", error);
      }
    }

    loadClientPackage();
  }, [selectedClientId]);

  const handleSave = async () => {
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

    const [hourStr, minuteStr] = time.split(":");
    const fullDateTime = new Date(date);
    fullDateTime.setHours(Number(hourStr), Number(minuteStr), 0, 0);

    setSaving(true);
    try {
      const result = await createAppointment({
        clientId: selectedClientId,
        serviceId: selectedServiceId,
        dateTime: fullDateTime,
        packageId: usePackage && activePackage ? activePackage.id : undefined,
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
            Marque um horário avulso ou use um pacote existente.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-4">
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

          {/* Pacote ativo */}
          {activePackage && (
            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/40">
              <div className="flex flex-col">
                <span className="text-sm font-medium">
                  Pacote ativo: {activePackage.name}
                </span>
                <span className="text-xs text-muted-foreground">
                  Restam{" "}
                  {activePackage.total_sessions - activePackage.used_sessions}{" "}
                  sessões
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-sm">Usar</Label>
                <Switch checked={usePackage} onCheckedChange={setUsePackage} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="service">Serviço</Label>
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

          {/* Data e Hora */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Recorrência */}
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
