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
  Package as PackageIcon,
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
  service_id: string;
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
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string | undefined>(undefined);

  // 🔥 ESTADOS DA RECORRÊNCIA
  const [isRecurring, setIsRecurring] = useState(false);
  const [repeatCount, setRepeatCount] = useState(2); // Começa em 2 semanas

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

  // Funções para manipular a quantidade de repetições
  const incrementRepeat = () => setRepeatCount((prev) => prev + 1);
  const decrementRepeat = () =>
    setRepeatCount((prev) => (prev > 2 ? prev - 1 : 2));

  // 1. CARREGA OPÇÕES
  useEffect(() => {
    async function loadOptions() {
      if (!open) return;
      setLoadingOptions(true);
      try {
        const [clientsRes, servicesRes] = await Promise.all([
          fetch("/api/admin/clients"),
          fetch("/api/services?active=true"),
        ]);

        if (clientsRes.ok) {
          const data = await clientsRes.json();
          setClients(
            (data.clients ?? []).map((c: any) => ({ id: c.id, name: c.name })),
          );
        }

        if (servicesRes.ok) {
          const data = await servicesRes.json();
          setServices(data.map((s: any) => ({ id: s.id, name: s.name })));
        }
      } catch (error) {
        console.error("Erro ao carregar opções:", error);
      } finally {
        setLoadingOptions(false);
      }
    }
    loadOptions();
  }, [open]);

  // 2. CARREGA PACOTE DO CLIENTE
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
        console.error("Erro ao buscar pacote:", error);
      }
    }
    loadClientPackage();
  }, [selectedClientId]);

  // 3. REGRA DE NEGÓCIO: Se usar pacote, trava o serviço
  // E sincroniza a recorrência com o saldo do pacote caso o usuário queira repetir
  useEffect(() => {
    if (usePackage && activePackage) {
      setSelectedServiceId(activePackage.service_id);

      // Se a pessoa ativou a recorrência usando um pacote, o máximo de repetições é o saldo
      const saldo = activePackage.total_sessions - activePackage.used_sessions;
      if (isRecurring && repeatCount > saldo) {
        setRepeatCount(saldo > 0 ? saldo : 1);
      }
    }
  }, [usePackage, activePackage, isRecurring, repeatCount]);

  // Limpa o formulário ao fechar o modal
  useEffect(() => {
    if (!open) {
      setSelectedClientId(undefined);
      setSelectedServiceId(undefined);
      setUsePackage(false);
      setIsRecurring(false);
      setRepeatCount(2);
      setTime(undefined);
    }
  }, [open]);

  const handleSave = async () => {
    if (!selectedClientId || !selectedServiceId || !date || !time) {
      toast.error("Preencha todos os campos obrigatórios.");
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
        // 🔥 Envia a quantidade de vezes para repetir (ou 1 se não for recorrente)
        repeatCount: isRecurring ? repeatCount : 1,
      });

      if (!result.success) {
        toast.error(result.error || "Erro ao salvar agendamento.");
        return;
      }

      toast.success(
        isRecurring
          ? `Agendado e repetido por ${repeatCount} semanas!`
          : "Agendamento criado com sucesso!",
      );
      onOpenChange(false);
      onCreated?.();
    } catch (error) {
      toast.error("Erro inesperado ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const saldoDisponivel = activePackage
    ? activePackage.total_sessions - activePackage.used_sessions
    : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Novo Agendamento
          </DialogTitle>
          <DialogDescription>
            Escolha o serviço, a data e, se quiser, agende para as próximas
            semanas.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* SELEÇÃO DE CLIENTE */}
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <Select
              value={selectedClientId}
              onValueChange={setSelectedClientId}
            >
              <SelectTrigger className="bg-background rounded-xl h-11">
                <SelectValue
                  placeholder={
                    loadingOptions ? "Carregando..." : "Selecione a cliente..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* PACOTE ATIVO (Destaque Visual) */}
          {activePackage && (
            <div
              className={cn(
                "flex items-center justify-between p-4 rounded-2xl border transition-all",
                usePackage
                  ? "bg-primary/10 border-primary"
                  : "bg-muted/30 border-border/40",
              )}
            >
              <div className="flex items-center gap-3">
                <div className="bg-primary/20 p-2 rounded-full">
                  <PackageIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-bold">
                    {activePackage.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Saldo: {saldoDisponivel} sessões
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-xs font-bold uppercase cursor-pointer">
                  Usar
                </Label>
                <Switch checked={usePackage} onCheckedChange={setUsePackage} />
              </div>
            </div>
          )}

          {/* SELEÇÃO DE SERVIÇO */}
          <div className="flex flex-col gap-2">
            <Label>Serviço</Label>
            <Select
              disabled={loadingOptions || usePackage}
              value={selectedServiceId}
              onValueChange={setSelectedServiceId}
            >
              <SelectTrigger
                className={cn(
                  "rounded-xl bg-background h-11",
                  usePackage && "opacity-60 grayscale",
                )}
              >
                <SelectValue placeholder="Selecione o serviço..." />
              </SelectTrigger>
              <SelectContent>
                {services.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {usePackage && (
              <p className="text-[10px] text-primary font-medium italic">
                * Serviço vinculado ao pacote selecionado.
              </p>
            )}
          </div>

          {/* DATA E HORA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Data (Primeira sessão)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="rounded-xl justify-start text-left font-normal h-11"
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
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <Label>Horário</Label>
              <Select value={time} onValueChange={setTime}>
                <SelectTrigger className="rounded-xl bg-background h-11">
                  <Clock className="mr-2 h-4 w-4 opacity-50" />
                  <SelectValue placeholder="Escolha" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 🔥 SEÇÃO DE RECORRÊNCIA (Repetição) */}
          <div className="border border-border/60 bg-muted/10 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Repeat className="h-4 w-4 text-muted-foreground" />
                <Label className="font-semibold cursor-pointer">
                  Agendamento Recorrente
                </Label>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {isRecurring && (
              <div className="flex items-center justify-between pt-2 border-t border-border/50 animate-in fade-in duration-200">
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Repetir por:</span>
                  <span className="text-xs text-muted-foreground">
                    Ocupará a agenda nas próximas {repeatCount} semanas.
                  </span>
                  {usePackage && repeatCount === saldoDisponivel && (
                    <span className="text-[10px] text-destructive font-semibold mt-1">
                      Limite de saldo do pacote atingido.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3 bg-background border rounded-lg p-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md hover:bg-muted"
                    onClick={decrementRepeat}
                    disabled={repeatCount <= 2}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-6 text-center font-bold text-sm">
                    {repeatCount}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-md hover:bg-muted"
                    onClick={incrementRepeat}
                    // Se estiver usando pacote, o botão de mais trava no limite do saldo
                    disabled={usePackage && repeatCount >= saldoDisponivel}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="pt-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            className="rounded-xl px-8 shadow-md"
            disabled={saving}
          >
            {saving ? "Salvando..." : "Confirmar na Agenda"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
