"use client";

import { useState } from "react";
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
import { CalendarClock, Repeat } from "lucide-react";

interface NewAppointmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewAppointmentModal({
  open,
  onOpenChange,
}: NewAppointmentModalProps) {
  // Estado para controlar se o pacote é recorrente
  const [isRecurring, setIsRecurring] = useState(false);

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
              <SelectTrigger id="client">
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
              <SelectTrigger id="service">
                <SelectValue placeholder="Selecione o serviço..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drenagem">Drenagem Linfática</SelectItem>
                <SelectItem value="relaxante">Massagem Relaxante</SelectItem>
                <SelectItem value="combo">Projeto Verão (Combo)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data e Hora (Lado a Lado) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Data da 1ª Sessão</Label>
              <Input id="date" type="date" />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Horário</Label>
              <Input id="time" type="time" />
            </div>
          </div>

          <div className="h-px bg-border/50 my-1" />

          {/* A Mágica da Recorrência */}
          <div className="flex flex-col gap-4 bg-muted/30 p-3 rounded-lg border border-border/50">
            <div className="flex items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <Label className="flex items-center gap-2 text-foreground font-semibold">
                  <Repeat className="h-4 w-4 text-primary" />
                  Repetir semanalmente?
                </Label>
                <span className="text-xs text-muted-foreground">
                  Ideal para pacotes fixos.
                </span>
              </div>
              <Switch checked={isRecurring} onCheckedChange={setIsRecurring} />
            </div>

            {/* Campo que só aparece se a repetição estiver ativada */}
            {isRecurring && (
              <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                <Label htmlFor="sessions">Quantas sessões tem o pacote?</Label>
                <Input
                  id="sessions"
                  type="number"
                  min="2"
                  placeholder="Ex: 5, 10..."
                  className="bg-background"
                />
                <p className="text-[11px] text-muted-foreground">
                  O sistema irá agendar automaticamente este mesmo horário para
                  as próximas semanas.
                </p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Salvar Agendamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
