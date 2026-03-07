"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Clock, Loader2, Plus, Trash2, Timer } from "lucide-react";
import { toast } from "sonner";

type Duration = {
  id: string;
  label: string;
  minutes: number;
};

// Movida para fora para poder ser usada dentro do onChange
const formatDuration = (minutes: number) => {
  if (minutes < 60) return `${minutes}min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
};

export function DurationManager() {
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [durations, setDurations] = useState<Duration[]>([]);

  const [form, setForm] = useState({
    label: "",
    hours: "",
    minutes: "",
  });

  // 🔥 Estado que controla se o usuário digitou um nome manualmente
  const [isCustomLabel, setIsCustomLabel] = useState(false);

  useEffect(() => {
    fetchDurations();
  }, []);

  const fetchDurations = async () => {
    try {
      const res = await fetch("/api/service-durations");
      if (res.ok) {
        const data = await res.json();
        setDurations(data);
      }
    } catch (error) {
      console.error("Erro ao buscar durações:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const calculateMinutes = () => {
    const h = Number(form.hours) || 0;
    const m = Number(form.minutes) || 0;
    return h * 60 + m;
  };

  // 🔥 Função que atualiza o tempo e auto-preenche o nome
  const handleTimeChange = (field: "hours" | "minutes", value: string) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      const h = Number(newForm.hours) || 0;
      const m = Number(newForm.minutes) || 0;
      const total = h * 60 + m;

      // Se o usuário não personalizou o nome, auto-preenchemos
      if (!isCustomLabel) {
        newForm.label = total > 0 ? formatDuration(total) : "";
      }

      return newForm;
    });
  };

  const handleAdd = async () => {
    const totalMinutes = calculateMinutes();

    if (!form.label.trim()) {
      toast.error("Digite um nome para a duração");
      return;
    }

    if (totalMinutes < 1) {
      toast.error("Duração deve ser maior que zero");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/service-durations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          label: form.label,
          minutes: totalMinutes,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success("Duração cadastrada!");
        // 🔥 Reseta o formulário e a trava de personalização
        setForm({ label: "", hours: "", minutes: "" });
        setIsCustomLabel(false);
        fetchDurations();
      } else {
        toast.error(data.error || "Erro ao cadastrar");
      }
    } catch (error) {
      console.error("Erro ao cadastrar duração:", error);
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover esta duração?")) return;

    try {
      const res = await fetch(`/api/service-durations?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success("Duração removida!");
        fetchDurations();
      } else {
        toast.error("Erro ao remover");
      }
    } catch (error) {
      console.error("Erro ao remover duração:", error);
      toast.error("Erro de conexão");
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Timer className="h-5 w-5 text-primary" />
            Cadastrar Nova Duração
          </CardTitle>
          <CardDescription>
            Defina as opções de tempo que aparecerão ao criar serviços.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <Label className="text-foreground font-medium">
                Nome da Duração
              </Label>
              <Input
                placeholder="Ex: 1h 30min"
                value={form.label}
                onChange={(e) => {
                  setForm({ ...form, label: e.target.value });
                  setIsCustomLabel(true); // Trava o auto-preenchimento ao digitar aqui
                }}
                className="bg-muted/50 border-border/50 h-11"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground font-medium">Horas</Label>
              <Input
                type="number"
                min="0"
                max="12"
                placeholder="0"
                value={form.hours}
                onChange={(e) => handleTimeChange("hours", e.target.value)}
                // 🔥 Classes adicionadas para remover as setas nativas do input number
                className="bg-muted/50 border-border/50 h-11 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label className="text-foreground font-medium">Minutos</Label>
              <Input
                type="number"
                min="0"
                max="59"
                step="5"
                placeholder="0"
                value={form.minutes}
                onChange={(e) => handleTimeChange("minutes", e.target.value)}
                // 🔥 Classes adicionadas para remover as setas nativas do input number
                className="bg-muted/50 border-border/50 h-11 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [-moz-appearance:textfield]"
              />
            </div>
          </div>

          {/* Preview da Duração Total (Mantido como solicitado, mas agora o nome copia isso!) */}
          {calculateMinutes() > 0 && (
            <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-sm text-muted-foreground">
                Duração total:{" "}
                <span className="font-bold text-foreground">
                  {formatDuration(calculateMinutes())}
                </span>
              </p>
            </div>
          )}

          <Button
            onClick={handleAdd}
            disabled={loading}
            className="mt-4 w-full md:w-auto rounded-full md:rounded-md"
          >
            {loading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Adicionar Duração
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Durações Cadastradas */}
      <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            Durações Cadastradas
          </CardTitle>
        </CardHeader>
        <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
          {durations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
              <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-semibold text-foreground">
                Nenhuma duração cadastrada
              </h3>
              <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                Cadastre as opções de tempo que você oferece para seus serviços.
              </p>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {durations.map((duration) => (
                <div
                  key={duration.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {duration.label}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {formatDuration(duration.minutes)}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(duration.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
