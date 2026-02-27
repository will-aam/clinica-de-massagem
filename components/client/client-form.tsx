// components/client/client-form.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  User,
  CreditCard,
  Phone,
  Package,
  Loader2,
  CheckCircle2,
  Mail,
  CalendarDays,
  MapPin,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

// Máscaras (Exportadas para uso local)
function formatCpfInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function formatCepInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function ClientForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);

  // O estado agora engloba os novos campos
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone_whatsapp: "",
    email: "",
    birth_date: "", // Novo
    cep: "", // Novo
    street: "", // Novo
    number: "", // Novo
    city: "", // Novo
    state: "", // Novo
    total_sessions: "10",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";

    // CPF totalmente OBRIGATÓRIO (exatamente 11 dígitos)
    if (form.cpf.replace(/\D/g, "").length !== 11) {
      errs.cpf = "CPF inválido ou incompleto";
    }

    if (form.phone_whatsapp.replace(/\D/g, "").length < 10) {
      errs.phone_whatsapp = "Telefone inválido";
    }

    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Formato inválido";
    }

    if (!form.total_sessions || Number(form.total_sessions) < 1) {
      errs.total_sessions = "Mín. 1";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      // Formata os dados para enviar para a API (Você precisará atualizar seu Prisma Schema depois)
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_sessions: Number(form.total_sessions),
        }),
      });

      if (res.ok) {
        toast.success("Cliente cadastrado com sucesso!");
        router.push("/admin/clients");
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao cadastrar cliente");
      }
    } catch {
      toast.error("Erro de conexão");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 md:gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 items-start">
        {/* COLUNA ESQUERDA: Dados do Cliente (Ocupa 2/3) */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Ficha do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-4 md:gap-5">
              {/* NOME (Obrigatório) */}
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-foreground font-medium">
                  Nome Completo *
                </Label>
                <Input
                  id="name"
                  placeholder="Ex: Maria Silva"
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

              {/* WHATSAPP e CPF */}
              <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="phone"
                    className="flex items-center gap-2 text-foreground font-medium"
                  >
                    <Phone className="h-4 w-4 text-muted-foreground" /> WhatsApp
                    *
                  </Label>
                  <Input
                    id="phone"
                    placeholder="(00) 90000-0000"
                    value={form.phone_whatsapp}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone_whatsapp: formatPhoneInput(e.target.value),
                      })
                    }
                    className="bg-muted/50 border-border/50 h-11"
                  />
                  {errors.phone_whatsapp && (
                    <p className="text-xs font-medium text-destructive ml-1">
                      {errors.phone_whatsapp}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="cpf"
                    className="flex items-center gap-2 text-foreground font-medium"
                  >
                    <CreditCard className="h-4 w-4 text-muted-foreground" /> CPF
                    *
                  </Label>
                  <Input
                    id="cpf"
                    placeholder="000.000.000-00"
                    value={form.cpf}
                    onChange={(e) =>
                      setForm({ ...form, cpf: formatCpfInput(e.target.value) })
                    }
                    className="bg-muted/50 border-border/50 font-mono h-11"
                  />
                  {errors.cpf && (
                    <p className="text-xs font-medium text-destructive ml-1">
                      {errors.cpf}
                    </p>
                  )}
                </div>
              </div>

              {/* BOTÃO "MAIS OPÇÕES" (Collapsible) */}
              <Collapsible
                open={showMore}
                onOpenChange={setShowMore}
                className="mt-2 w-full border-t border-border/50 pt-4"
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full flex justify-between items-center text-muted-foreground hover:text-primary hover:bg-primary/5 rounded-xl"
                  >
                    <span className="font-medium">
                      {showMore
                        ? "Ocultar campos adicionais"
                        : "Preencher ficha completa"}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${showMore ? "rotate-180" : ""}`}
                    />
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                  {/* ANIVERSÁRIO E EMAIL */}
                  <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="birth_date"
                        className="flex items-center gap-2 text-foreground font-medium"
                      >
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />{" "}
                        Nascimento
                      </Label>
                      <Input
                        id="birth_date"
                        type="date"
                        value={form.birth_date}
                        onChange={(e) =>
                          setForm({ ...form, birth_date: e.target.value })
                        }
                        className="bg-muted/50 border-border/50 h-11 block w-full"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <Label
                        htmlFor="email"
                        className="flex items-center gap-2 text-foreground font-medium"
                      >
                        <Mail className="h-4 w-4 text-muted-foreground" />{" "}
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="cliente@email.com"
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="bg-muted/50 border-border/50 h-11"
                      />
                      {errors.email && (
                        <p className="text-xs font-medium text-destructive ml-1">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* ENDEREÇO RÁPIDO */}
                  <div className="flex flex-col gap-2">
                    <Label className="flex items-center gap-2 text-foreground font-medium mb-1 mt-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />{" "}
                      Endereço
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      <Input
                        placeholder="CEP"
                        value={form.cep}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            cep: formatCepInput(e.target.value),
                          })
                        }
                        className="col-span-1 bg-muted/50 h-11"
                      />
                      <Input
                        placeholder="Cidade/UF"
                        value={form.city}
                        onChange={(e) =>
                          setForm({ ...form, city: e.target.value })
                        }
                        className="col-span-2 bg-muted/50 h-11"
                      />
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      <Input
                        placeholder="Rua / Avenida"
                        value={form.street}
                        onChange={(e) =>
                          setForm({ ...form, street: e.target.value })
                        }
                        className="col-span-3 bg-muted/50 h-11"
                      />
                      <Input
                        placeholder="Nº"
                        value={form.number}
                        onChange={(e) =>
                          setForm({ ...form, number: e.target.value })
                        }
                        className="col-span-1 bg-muted/50 h-11"
                      />
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        </div>

        {/* COLUNA DIREITA: Pacote Inicial (Ocupa 1/3) */}
        <Card className="lg:col-span-1 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card mt-2 lg:mt-0 sticky top-4">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6">
            <CardTitle className="text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Pacote Inicial
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2 bg-primary/5 p-4 rounded-xl border border-primary/10">
              <Label
                htmlFor="sessions"
                className="text-foreground font-medium text-center"
              >
                Quantidade de Sessões
              </Label>
              <Input
                id="sessions"
                type="number"
                min="1"
                max="50"
                value={form.total_sessions}
                onChange={(e) =>
                  setForm({ ...form, total_sessions: e.target.value })
                }
                className="bg-background border-border/50 h-14 text-2xl font-black text-center"
              />
              <p className="text-xs text-muted-foreground text-center mt-1 leading-tight">
                Quantas sessões o cliente contratou inicialmente?
              </p>
              {errors.total_sessions && (
                <p className="text-xs font-medium text-destructive text-center">
                  {errors.total_sessions}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RODAPÉ DO FORMULÁRIO (Fixo na Base) */}
      <div className="flex items-center justify-end gap-3 pt-4 mt-2 border-t border-border/50">
        <Button
          asChild
          variant="ghost"
          className="hidden sm:flex text-muted-foreground rounded-full md:rounded-md"
        >
          <Link href="/admin/clients">Cancelar</Link>
        </Button>
        <Button
          type="submit"
          size="lg"
          disabled={loading}
          className="w-full sm:w-auto py-6 rounded-full md:rounded-md shadow-sm hover:shadow-md transition-all active:scale-[0.98] font-semibold text-base"
        >
          {loading ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-5 w-5" />
          )}
          {loading ? "Salvando..." : "Finalizar Cadastro"}
        </Button>
      </div>
    </form>
  );
}
