"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  Package,
  Layers,
  DollarSign,
  CalendarDays,
  Save,
  Loader2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export function PackageForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    total_sessions: "10",
    price: "",
    validity_days: "90",
    is_active: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (!form.total_sessions || Number(form.total_sessions) < 1) {
      errs.total_sessions = "Mínimo 1 sessão";
    }
    if (!form.price || Number(form.price) <= 0) {
      errs.price = "Preço deve ser maior que zero";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/package-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          description: form.description || null,
          total_sessions: Number(form.total_sessions),
          price: Number(form.price),
          validity_days: form.validity_days ? Number(form.validity_days) : null,
          is_active: form.is_active,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Pacote cadastrado com sucesso!");
        router.push("/admin/services?tab=packages");
      } else {
        toast.error(data.error || "Erro ao cadastrar pacote");
      }
    } catch (error) {
      console.error("Erro ao salvar pacote:", error);
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* BLOCO 1: Informações do Pacote */}
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5 text-primary" />
            Dados do Pacote
          </CardTitle>
          <CardDescription>
            Crie combos ou planos mensais para vender aos seus clientes.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
          <div className="grid md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="name" className="text-foreground font-medium">
                Nome do Pacote / Plano *
              </Label>
              <Input
                id="name"
                placeholder="Ex: Pacote Projeto Verão (10 Sessões)"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="bg-muted/50 border-border/50 h-11"
              />
              {errors.name && (
                <p className="text-xs font-medium text-destructive ml-1">
                  {errors.name}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <Label
                htmlFor="sessions"
                className="flex items-center gap-2 text-foreground font-medium"
              >
                <Layers className="h-4 w-4 text-muted-foreground" />
                Quantidade de Sessões *
              </Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                placeholder="Ex: 10"
                value={form.total_sessions}
                onChange={(e) =>
                  setForm({ ...form, total_sessions: e.target.value })
                }
                className="bg-muted/50 border-border/50 h-11 font-bold"
              />
              {errors.total_sessions && (
                <p className="text-xs font-medium text-destructive ml-1">
                  {errors.total_sessions}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label
              htmlFor="description"
              className="text-foreground font-medium"
            >
              Descrição e Regras
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva o que está incluso. Ex: Contém 5 Drenagens e 5 Modeladoras. Válido apenas para dias úteis."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className="bg-muted/50 border-border/50 min-h-20 resize-none"
            />
          </div>
        </CardContent>
      </Card>

      {/* BLOCO 2: Regras Comerciais (Financeiro e Validade) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-primary" />
              Preço de Venda
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="price" className="text-foreground font-medium">
                Valor Total do Pacote (R$) *
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                  R$
                </span>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-muted/50 border-border/50 h-11 pl-9 font-bold text-lg text-primary"
                />
              </div>
              {errors.price && (
                <p className="text-xs font-medium text-destructive ml-1">
                  {errors.price}
                </p>
              )}
              <p className="text-[11px] text-muted-foreground">
                Este é o valor que será lançado no financeiro quando o cliente
                contratar.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              <CalendarDays className="h-5 w-5 text-primary" />
              Validade
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label htmlFor="validity" className="text-foreground font-medium">
                Dias para expirar
              </Label>
              <div className="relative">
                <Input
                  id="validity"
                  type="number"
                  min="0"
                  placeholder="Ex: 90"
                  value={form.validity_days}
                  onChange={(e) =>
                    setForm({ ...form, validity_days: e.target.value })
                  }
                  className="bg-muted/50 border-border/50 h-11 pr-12"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">
                  dias
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Tempo limite para o cliente consumir todas as sessões. Deixe
                vazio para sem limite.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 3: Status */}
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardContent className="px-0 pt-0 md:p-6 flex items-center justify-between">
          <div className="flex flex-col gap-1 pr-4">
            <Label className="flex items-center gap-2 text-foreground font-medium text-base">
              <Sparkles className="h-5 w-5 text-primary" />
              Pacote Ativo
            </Label>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Deixe ativado para que este pacote apareça na lista de vendas para
              novos clientes.
            </p>
          </div>
          <Switch
            checked={form.is_active}
            onCheckedChange={(checked) =>
              setForm({ ...form, is_active: checked })
            }
          />
        </CardContent>
      </Card>

      {/* RODAPÉ */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
        <Button
          asChild
          variant="ghost"
          type="button"
          className="hidden sm:flex text-muted-foreground rounded-full md:rounded-md"
        >
          <Link href="/admin/services?tab=packages">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto rounded-full md:rounded-md shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Save className="mr-2 h-5 w-5" />
          )}
          {loading ? "Salvando..." : "Salvar Pacote"}
        </Button>
      </div>
    </form>
  );
}
