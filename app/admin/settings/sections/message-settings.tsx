// app/admin/settings/sections/message-settings.tsx
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
import { MessageSquare, HelpCircle, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function MessageSettings() {
  const { toast } = useToast();
  const [phone, setPhone] = useState("");
  const [showTip, setShowTip] = useState(false);

  // Estados para os diferentes templates
  const [msgUpdate, setMsgUpdate] = useState(
    "Olá, {nome}! Tudo bem? 💆‍♀️✨\n\nPassando para avisar que seu check-in foi registrado. Você já realizou {usadas} de {total} sessões do seu pacote.",
  );
  const [msgWelcome, setMsgWelcome] = useState(
    "Olá, {nome}! Que alegria ter você aqui na nossa empresa. 🥰\n\nSeu pacote de {total} sessões já está ativo no nosso sistema. Qualquer dúvida, é só chamar!",
  );
  const [msgRenewal, setMsgRenewal] = useState(
    "Parabéns, {nome}! 🎉 Você concluiu hoje a última sessão do seu pacote.\n\nComo o seu bem-estar é nossa prioridade, que tal já deixarmos o seu próximo pacote garantido? Responda SIM para vermos os horários!",
  );
  const [msgReminder, setMsgReminder] = useState(
    "Oi, {nome}! Passando para lembrar do nosso horário agendado para amanhã às {horario}. \n\nPodemos confirmar sua presença? 👍",
  );

  // Carrega as configurações salvas (se existirem)
  useEffect(() => {
    const savedTemplates = localStorage.getItem("whatsapp_templates");
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.msgUpdate) setMsgUpdate(parsed.msgUpdate);
        if (parsed.msgWelcome) setMsgWelcome(parsed.msgWelcome);
        if (parsed.msgRenewal) setMsgRenewal(parsed.msgRenewal);
        if (parsed.msgReminder) setMsgReminder(parsed.msgReminder);
      } catch (e) {
        console.error("Erro ao carregar templates", e);
      }
    }
  }, []);

  // Salva no LocalStorage
  const handleSave = () => {
    const templatesToSave = {
      phone,
      msgUpdate,
      msgWelcome,
      msgRenewal,
      msgReminder,
    };

    localStorage.setItem("whatsapp_templates", JSON.stringify(templatesToSave));

    toast({
      title: "Mensagens salvas!",
      description: "Os modelos de WhatsApp foram atualizados com sucesso.",
    });
  };

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
            <Button onClick={handleSave} className="shrink-0">
              <Save className="h-4 w-4 mr-2" />
              Salvar WhatsApp
            </Button>
          </div>
        </CardHeader>

        <CardContent className="grid gap-6 px-0 pb-0 md:pb-6 md:px-6">
          {/* Número de Contato */}
          <div className="grid gap-2 border-b pb-6">
            <Label htmlFor="phone" className="text-foreground font-medium">
              Seu Número de WhatsApp (Remetente)
            </Label>
            <div className="flex gap-2">
              <Input
                id="phone"
                placeholder="Ex: 5511999999999"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="max-w-xs bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Deixe em branco se for usar o número do aparelho que está logado.
              Coloque o código do país (ex: 55).
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
