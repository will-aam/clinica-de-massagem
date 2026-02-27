"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Clock,
  Palette,
  DollarSign,
  TrendingDown,
  Tag,
  AlignLeft,
  Globe,
  Save,
  Loader2,
} from "lucide-react";

export function ServiceForm() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "",
    description: "",
    duration: "60",
    color: "#D9C6BF", // Cor padrão da paleta do seu projeto
    price: "",
    cost: "",
    isOnline: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulação de salvamento na API
    setTimeout(() => {
      setLoading(false);
      console.log("Serviço Salvo:", form);
    }, 1000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* BLOCO 1: Informações Básicas */}
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Sparkles className="h-5 w-5 text-primary" />
            Informações do Serviço
          </CardTitle>
          <CardDescription>
            Detalhes principais de como o serviço será apresentado.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            {/* Nome do Serviço */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Nome do Serviço
              </Label>
              <Input
                id="name"
                placeholder="Ex: Massagem Relaxante"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-muted/50 border-border/50 h-11"
                required
              />
            </div>

            {/* Categoria */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="category"
                className="flex items-center gap-2 text-foreground font-medium"
              >
                <Tag className="h-4 w-4 text-muted-foreground" />
                Categoria
              </Label>
              <Select
                value={form.category}
                onValueChange={(v) => setForm({ ...form, category: v })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50 h-11">
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="massagem">Massagem</SelectItem>
                  <SelectItem value="estetica_facial">
                    Estética Facial
                  </SelectItem>
                  <SelectItem value="estetica_corporal">
                    Estética Corporal
                  </SelectItem>
                  <SelectItem value="manicure">Manicure / Pedicure</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Descrição */}
          <div className="flex flex-col gap-2">
            <Label
              htmlFor="description"
              className="flex items-center gap-2 text-foreground font-medium"
            >
              <AlignLeft className="h-4 w-4 text-muted-foreground" />
              Descrição (Para o Cliente)
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o que está incluso neste serviço. Isso aparecerá no agendamento online."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="bg-muted/50 border-border/50 min-h-25 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BLOCO 2: Agenda e Visual */}
        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Agenda e Visual
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
            {/* Duração */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="duration" className="text-foreground font-medium">
                Duração Estimada
              </Label>
              <Select
                value={form.duration}
                onValueChange={(v) => setForm({ ...form, duration: v })}
              >
                <SelectTrigger className="bg-muted/50 border-border/50 h-11">
                  <SelectValue placeholder="Tempo de atendimento" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">1 hora</SelectItem>
                  <SelectItem value="90">1 hora e 30 minutos</SelectItem>
                  <SelectItem value="120">2 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Cor na Agenda */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="color"
                className="flex items-center gap-2 text-foreground font-medium"
              >
                <Palette className="h-4 w-4 text-muted-foreground" />
                Cor na Agenda
              </Label>
              <div className="flex items-center gap-3">
                <div className="relative h-11 w-11 rounded-full overflow-hidden border-2 border-border shadow-sm shrink-0">
                  <input
                    type="color"
                    id="color"
                    value={form.color}
                    onChange={(e) =>
                      setForm({ ...form, color: e.target.value })
                    }
                    className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Escolha a cor que representará este serviço no calendário.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BLOCO 3: Financeiro */}
        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Financeiro
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
            {/* Preço */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="price" className="text-foreground font-medium">
                Preço de Venda (R$)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  id="price"
                  type="number"
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-muted/50 border-border/50 h-11 pl-9 font-medium text-lg"
                />
              </div>
            </div>

            {/* Custo de Insumo */}
            <div className="flex flex-col gap-2">
              <Label
                htmlFor="cost"
                className="flex items-center gap-2 text-foreground font-medium"
              >
                <TrendingDown className="h-4 w-4 text-destructive" />
                Custo de Material (R$)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  id="cost"
                  type="number"
                  placeholder="0,00"
                  value={form.cost}
                  onChange={(e) => setForm({ ...form, cost: e.target.value })}
                  className="bg-muted/50 border-border/50 h-11 pl-9"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Gasto médio com cremes, óleos, descartáveis, etc.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 4: Configurações Extras (Switch) */}
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardContent className="px-0 pt-0 md:p-6 flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-4">
            <Label className="flex items-center gap-2 text-foreground font-medium text-base">
              <Globe className="h-5 w-5 text-primary" />
              Disponível no Agendamento Online
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Permite que os clientes vejam e agendem este serviço sozinhos pela
              internet.
            </p>
          </div>
          <Switch
            checked={form.isOnline}
            onCheckedChange={(checked) =>
              setForm({ ...form, isOnline: checked })
            }
          />
        </CardContent>
      </Card>

      {/* RODAPÉ: Botões de Ação */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          variant="ghost"
          className="hidden sm:flex text-muted-foreground rounded-full"
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto rounded-full shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          Salvar Serviço
        </Button>
      </div>
    </form>
  );
}
