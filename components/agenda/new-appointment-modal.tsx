"use client";

import { useState } from "react";
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

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Gera os horários de 30 em 30 minutos (08:00 até 19:00)
const TIME_SLOTS = Array.from({ length: 23 }, (_, i) => {
  const hour = Math.floor(i / 2) + 8;
  const minute = i % 2 === 0 ? "00" : "30";
  return `${hour.toString().padStart(2, "0")}:${minute}`;
});

export function NewAppointmentModal({
  open,
  onOpenChange,
}: NewAppointmentModalProps) {
  const [isRecurring, setIsRecurring] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [sessions, setSessions] = useState(5);

  const incrementSessions = () => setSessions((prev) => prev + 1);
  const decrementSessions = () =>
    setSessions((prev) => (prev > 2 ? prev - 1 : 2));

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
            <Select>
              <SelectTrigger id="client" className="bg-background">
                <SelectValue placeholder="Selecione a cliente..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="leda">Leda Paula</SelectItem>
                <SelectItem value="mariana">Mariana Costa</SelectItem>
                <SelectItem value="camila">Camila Silva</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seleção de Serviço */}
          <div className="flex flex-col gap-2">
            <Label htmlFor="service">Serviço ou Pacote</Label>
            <Select>
              <SelectTrigger id="service" className="bg-background">
                <SelectValue placeholder="Selecione o serviço..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drenagem">Drenagem Linfática</SelectItem>
                <SelectItem value="relaxante">Massagem Relaxante</SelectItem>
                <SelectItem value="combo">Projeto Verão (Combo)</SelectItem>
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
              <Select>
                <SelectTrigger id="time" className="bg-background">
                  <Clock className="mr-2 h-4 w-4 opacity-50 shrink-0" />
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="max-h-50">
                  {TIME_SLOTS.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
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

            {/* Input Numérico Customizado (Sem setas padrão) */}
            {isRecurring && (
              <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 pt-2 border-t border-border/50 mt-1">
                <div className="flex items-center justify-between">
                  <Label>Quantidade de sessões</Label>

                  {/* Controlador Numérico Minimalista */}
                  <div className="flex items-center gap-1 bg-background border border-border/50 rounded-lg p-0.5 shadow-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-muted"
                      onClick={decrementSessions}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>

                    {/* Oculta as setas nativas via Tailwind no Chrome/Safari e Firefox */}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)} className="shadow-sm">
            Salvar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
