"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare, HelpCircle, Save, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

export function MessageSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [phoneSaved, setPhoneSaved] = useState(false); // 🔥 Indicador visual
  const [phone, setPhone] = useState("");
  const [showTip, setShowTip] = useState(false);

  // Estados para os diferentes templates
  const [msgUpdate, setMsgUpdate] = useState("");
  const [msgWelcome, setMsgWelcome] = useState("");
  const [msgRenewal, setMsgRenewal] = useState("");
  const [msgReminder, setMsgReminder] = useState("");

  // 🔥 Busca dados do banco quando carrega
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch("/api/settings/messages");
        if (res.ok) {
          const data = await res.json();
          setPhone(data.phone || "");
          setMsgUpdate(
            data.msgUpdate ||
              "Olá, {nome}! Tudo bem? 💆‍♀️✨\n\nPassando para avisar que seu check-in foi registrado. Você já realizou {usadas} de {total} sessões do seu pacote.",
          );
          setMsgWelcome(
            data.msgWelcome ||
              "Olá, {nome}! Que alegria ter você aqui na nossa empresa. 🥰\n\nSeu pacote de {total} sessões já está ativo no nosso sistema. Qualquer dúvida, é só chamar!",
          );
          setMsgRenewal(
            data.msgRenewal ||
              "Parabéns, {nome}! 🎉 Você concluiu hoje a última sessão do seu pacote.\n\nComo o seu bem-estar é nossa prioridade, que tal já deixarmos o seu próximo pacote garantido? Responda SIM para vermos os horários!",
          );
          setMsgReminder(
            data.msgReminder ||
              "Oi, {nome}! Passando para lembrar do nosso horário agendado para amanhã às {horario}. \n\nPodemos confirmar sua presença? 👍",
          );
        } else {
          toast.error("Erro ao carregar mensagens");
        }
      } catch (error) {
        console.error("Erro ao buscar mensagens:", error);
        toast.error("Erro de conexão");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // 🔥 SALVA APENAS O WHATSAPP quando pressionar ENTER
  const handlePhoneSave = async () => {
    if (!phone.trim()) {
      toast.error("Digite um número de WhatsApp");
      return;
    }

    setPhoneSaved(false);

    try {
      const res = await fetch("/api/settings/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          msgUpdate,
          msgWelcome,
          msgRenewal,
          msgReminder,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setPhoneSaved(true);
        toast.success("Número de WhatsApp salvo!");
        setTimeout(() => setPhoneSaved(false), 2000);
      } else {
        toast.error(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar WhatsApp:", error);
      toast.error("Erro de conexão");
    }
  };

  // 🔥 Detecta quando o usuário pressiona ENTER no campo de telefone
  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePhoneSave();
    }
  };

  // 🔥 Salva TUDO (WhatsApp + Templates)
  const handleSaveAll = async () => {
    setSaving(true);

    try {
      const res = await fetch("/api/settings/messages", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          msgUpdate,
          msgWelcome,
          msgRenewal,
          msgReminder,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success("Mensagens salvas com sucesso!");
      } else {
        toast.error(data.error || "Erro ao salvar");
      }
    } catch (error) {
      console.error("Erro ao salvar:", error);
      toast.error("Erro de conexão");
    } finally {
      setSaving(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <Card className="border-0 bg-transparent shadow-none md:border md:bg-card md:shadow-sm">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-0 bg-transparent shadow-none md:border md:bg-card md:shadow-sm">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <MessageSquare className="h-5 w-5 text-primary" />
                Configurações de WhatsApp
              </CardTitle>
              <CardDescription className="mt-1.5">
                Defina o seu número e personalize os textos que o sistema
                enviará aos seus clientes.
              </CardDescription>
            </div>

            {/* Botão de Salvar Global da Seção */}
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              className="shrink-0"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Salvar Tudo
                </>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-0 pb-0 md:pb-6 md:px-6">
          {/* 🔥 Número de WhatsApp com Enter para salvar */}
          <div className="grid gap-2 border-b pb-6">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Seu Número de WhatsApp (Remetente)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1 max-w-xs">
                <Input
                  id="phone"
                  placeholder="Ex: 5511999999999"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setPhoneSaved(false);
                  }}
                  onKeyDown={handlePhoneKeyDown}
                  className="bg-muted pr-10"
                />
                {phoneSaved && (
                  <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500 animate-in fade-in zoom-in" />
                )}
              </div>
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-2">
              <HelpCircle className="h-3.5 w-3.5 text-primary" />
              <span>
                Pressione{" "}
                <kbd className="px-1.5 py-0.5 bg-muted border rounded text-[10px]">
                  Enter
                </kbd>{" "}
                após digitar para salvar rapidamente.
              </span>
            </p>
          </div>

          {/* Templates de Mensagem com Accordion */}
          <div>
            <div className="mb-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-foreground font-medium text-base">
                  Modelos de Mensagens (Templates)
                </Label>
                <button
                  type="button"
                  onClick={() => setShowTip(!showTip)}
                  className="text-muted-foreground hover:text-primary transition-colors p-1.5 rounded-full bg-muted/50 hover:bg-muted"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
              </div>

              {showTip && (
                <div className="bg-primary/10 text-primary px-3 py-2.5 rounded-md border border-primary/20 text-[13px] animate-in fade-in slide-in-from-top-2">
                  💡 <b>Dica:</b> Use as variáveis entre chaves (ex:{" "}
                  <code className="bg-background px-1 py-0.5 rounded text-primary">
                    {"{nome}"}
                  </code>
                  ) para o sistema personalizar automaticamente antes de enviar.
                </div>
              )}
            </div>

            <Accordion
              type="single"
              collapsible
              className="w-full border rounded-lg bg-card"
            >
              <AccordionItem value="item-1" className="border-b px-4">
                <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors">
                  1. Atualização de Pacote (Check-in)
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Textarea
                    rows={4}
                    value={msgUpdate}
                    onChange={(e) => setMsgUpdate(e.target.value)}
                    className="resize-none bg-muted focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviada quando o cliente faz check-in no Totem. <br />
                    Variáveis: <code className="text-primary">
                      {"{nome}"}
                    </code>, <code className="text-primary">{"{usadas}"}</code>,{" "}
                    <code className="text-primary">{"{total}"}</code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2" className="border-b px-4">
                <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors">
                  2. Renovação de Pacote (Upsell)
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Textarea
                    rows={4}
                    value={msgRenewal}
                    onChange={(e) => setMsgRenewal(e.target.value)}
                    className="resize-none bg-muted focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviada na última sessão do pacote para incentivar uma nova
                    compra. <br />
                    Variáveis: <code className="text-primary">{"{nome}"}</code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3" className="border-b px-4">
                <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors">
                  3. Boas-vindas (Novo Pacote)
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Textarea
                    rows={4}
                    value={msgWelcome}
                    onChange={(e) => setMsgWelcome(e.target.value)}
                    className="resize-none bg-muted focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Enviada quando um novo pacote é adicionado no painel. <br />
                    Variáveis: <code className="text-primary">
                      {"{nome}"}
                    </code>, <code className="text-primary">{"{total}"}</code>
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-4" className="px-4 border-0">
                <AccordionTrigger className="hover:no-underline hover:text-primary transition-colors">
                  4. Lembrete de Agendamento
                </AccordionTrigger>
                <AccordionContent className="pb-4">
                  <Textarea
                    rows={3}
                    value={msgReminder}
                    onChange={(e) => setMsgReminder(e.target.value)}
                    className="resize-none bg-muted focus-visible:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    Variáveis: <code className="text-primary">{"{nome}"}</code>,{" "}
                    <code className="text-primary">{"{horario}"}</code>
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
