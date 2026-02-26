"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  User,
  CreditCard,
  Phone,
  Package,
  Loader2,
  CheckCircle2,
  Mail, // Importamos o ícone de e-mail
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

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

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // 1. Adicionamos o campo email no estado inicial
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone_whatsapp: "",
    email: "",
    total_sessions: "10",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Nome é obrigatório";
    if (form.cpf.replace(/\D/g, "").length !== 11) errs.cpf = "CPF inválido";
    if (form.phone_whatsapp.replace(/\D/g, "").length < 10)
      errs.phone_whatsapp = "Telefone inválido";

    // Validação de E-mail (Se estiver preenchido, tem que ter um formato válido)
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "E-mail com formato inválido";
    }

    if (!form.total_sessions || Number(form.total_sessions) < 1)
      errs.total_sessions = "Mínimo 1 sessão";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
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
    <>
      <AdminHeader title="Novo Cliente" />

      <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-b border-border/50 pb-4 md:pb-6">
          <Button
            asChild
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 shrink-0"
          >
            <Link href="/admin/clients">
              <ArrowLeft className="h-5 w-5 text-muted-foreground" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Cadastrar Cliente
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Preencha as informações do cliente e o pacote inicial contratado.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 md:gap-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 sm:gap-4 md:gap-8">
            <Card className="md:col-span-2 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
              <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Dados Pessoais
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-4 md:gap-5">
                {/* NOME */}
                <div className="flex flex-col gap-2">
                  <Label htmlFor="name" className="text-foreground font-medium">
                    Nome Completo
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Maria Silva"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    className="bg-muted/50 border-border/50 h-11"
                  />
                  {errors.name && (
                    <p className="text-xs font-medium text-destructive ml-1">
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* CPF e WHATSAPP */}
                <div className="grid sm:grid-cols-2 gap-4 md:gap-5">
                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="cpf"
                      className="flex items-center gap-2 text-foreground font-medium"
                    >
                      <CreditCard className="h-4 w-4 text-muted-foreground" />{" "}
                      CPF
                    </Label>
                    <Input
                      id="cpf"
                      placeholder="000.000.000-00"
                      value={form.cpf}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          cpf: formatCpfInput(e.target.value),
                        }))
                      }
                      className="bg-muted/50 border-border/50 font-mono h-11"
                    />
                    {errors.cpf && (
                      <p className="text-xs font-medium text-destructive ml-1">
                        {errors.cpf}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Label
                      htmlFor="phone"
                      className="flex items-center gap-2 text-foreground font-medium"
                    >
                      <Phone className="h-4 w-4 text-muted-foreground" />{" "}
                      WhatsApp
                    </Label>
                    <Input
                      id="phone"
                      placeholder="(00) 90000-0000"
                      value={form.phone_whatsapp}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          phone_whatsapp: formatPhoneInput(e.target.value),
                        }))
                      }
                      className="bg-muted/50 border-border/50 h-11"
                    />
                    {errors.phone_whatsapp && (
                      <p className="text-xs font-medium text-destructive ml-1">
                        {errors.phone_whatsapp}
                      </p>
                    )}
                  </div>
                </div>

                {/* E-MAIL AQUI */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="email"
                    className="flex items-center gap-2 text-foreground font-medium"
                  >
                    <Mail className="h-4 w-4 text-muted-foreground" /> E-mail{" "}
                    <span className="text-muted-foreground/50 font-normal text-xs">
                      (Opcional)
                    </span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Ex: cliente@email.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, email: e.target.value }))
                    }
                    className="bg-muted/50 border-border/50 h-11"
                  />
                  {errors.email && (
                    <p className="text-xs font-medium text-destructive ml-1">
                      {errors.email}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-1 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card mt-2 md:mt-0">
              <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Pacote
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
                <div className="flex flex-col gap-1 bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <Label
                    htmlFor="sessions"
                    className="text-foreground font-medium"
                  >
                    Quantidade de Sessões
                  </Label>
                  <p className="text-[11px] text-muted-foreground mb-0 leading-tight">
                    Quantas sessões o cliente contratou neste primeiro pacote?
                  </p>
                  <Input
                    id="sessions"
                    type="number"
                    min="1"
                    max="50"
                    value={form.total_sessions}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, total_sessions: e.target.value }))
                    }
                    className="bg-background border-border/50 h-12 text-lg font-bold text-center mt-2"
                  />
                  {errors.total_sessions && (
                    <p className="text-xs font-medium text-destructive text-center mt-1">
                      {errors.total_sessions}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 mt-0 border-t border-border/50">
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
              className="w-full sm:w-auto py-5 sm:py-6 rounded-full md:rounded-md shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
