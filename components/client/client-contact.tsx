// components/client/client-contact.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageCircle,
  Mail,
  Trash2,
  Pencil,
  Check,
  X,
  Loader2,
  Share2,
} from "lucide-react";
import { toast } from "sonner";
import type { Client as ClientType, Package as PackageType } from "@/lib/data";

interface ClientContactProps {
  client: ClientType;
  activePackage: PackageType | null;
}

function formatPhoneInput(value: string) {
  const d = value.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function ClientContact({ client, activePackage }: ClientContactProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const clientEmail = (client as any).email || "";
  const [editPhone, setEditPhone] = useState(client.phone_whatsapp || "");
  const [editEmail, setEditEmail] = useState(clientEmail);

  // --- LÓGICA DAS MENSAGENS DE WHATSAPP ---
  const [templates, setTemplates] = useState({
    msgUpdate:
      "Olá, {nome}! Tudo bem? 💆‍♀️✨\n\nPassando para avisar que seu check-in foi registrado.",
    msgWelcome: "Olá, {nome}! Que alegria ter você aqui na nossa empresa. 🥰",
    msgRenewal:
      "Parabéns, {nome}! 🎉 Você concluiu hoje a última sessão do seu pacote.",
    msgReminder:
      "Oi, {nome}! Passando para lembrar do nosso horário agendado. 👍",
  });

  // Carrega as configurações do LocalStorage quando o componente monta
  useEffect(() => {
    const savedTemplates = localStorage.getItem("whatsapp_templates");
    if (savedTemplates) {
      try {
        const parsed = JSON.parse(savedTemplates);
        setTemplates((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Erro ao carregar templates do WhatsApp", e);
      }
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/clients/${client.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: client.name,
          cpf: client.cpf,
          phone_whatsapp: editPhone,
          email: editEmail,
        }),
      });
      if (res.ok) {
        toast.success("Contato atualizado!");
        setIsEditing(false);
        mutate(`/api/clients/${client.id}`);
      }
    } catch {
      toast.error("Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  // Função mágica que troca as variáveis pelo texto real
  const formatMessage = (template: string) => {
    // Pegar quantidade de sessões (se o cliente não tiver pacote, assume 0)
    const totalSessoes = activePackage?.total_sessions || 10;
    const usadas = activePackage?.used_sessions || 0;
    const nomeCurto = client.name.split(" ")[0];

    return template
      .replace(/{nome}/g, nomeCurto)
      .replace(/{usadas}/g, usadas.toString())
      .replace(/{total}/g, totalSessoes.toString())
      .replace(/{horario}/g, "09:00"); // Mock de horário
  };

  const handleSendWhatsApp = (templateText: string) => {
    // Limpa a formatação visual (ex: "(11) 98888-7777" vira "11988887777")
    const cleanPhone = client.phone_whatsapp?.replace(/\D/g, "");

    if (!cleanPhone || cleanPhone.length < 10) {
      toast.error(
        "O cliente não possui um número de WhatsApp válido cadastrado.",
      );
      return;
    }

    const message = formatMessage(templateText);
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank");
  };

  const handleEmail = () => {
    window.open(`mailto:${clientEmail}`, "_self");
  };

  return (
    <Card className="md:col-span-2 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Share2 className="h-5 w-5 text-primary" /> Contato e Mensagens
        </CardTitle>

        <div className="flex items-center gap-1">
          {isEditing ? (
            <div className="flex gap-1">
              <Button
                onClick={() => setIsEditing(false)}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving}
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 text-[#25D366]"
              >
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Check className="h-4 w-4" strokeWidth={3} />
                )}
              </Button>
            </div>
          ) : (
            <>
              <Button
                onClick={() => setIsEditing(true)}
                size="icon"
                variant="ghost"
                className="text-muted-foreground hover:text-primary rounded-full h-8 w-8"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive rounded-full h-8 w-8"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Excluir Cliente</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tem certeza? Esta ação não pode ser desfeita.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        /* função delete (não alterada) */
                      }}
                      className="bg-destructive text-white"
                    >
                      Excluir
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-5">
        {isEditing ? (
          <div className="flex flex-col gap-4 animate-in fade-in duration-300">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                WhatsApp
              </label>
              <Input
                value={editPhone}
                onChange={(e) => setEditPhone(formatPhoneInput(e.target.value))}
                className="bg-muted/50"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">
                E-mail
              </label>
              <Input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="bg-muted/50"
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            {/* NOVO: DROPDOWN MENU NO LUGAR DO BOTÃO SIMPLES */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-[#25D366] text-white hover:bg-[#128C7E] rounded-full flex-1 h-12 text-base">
                  <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-70">
                <DropdownMenuLabel>Qual mensagem enviar?</DropdownMenuLabel>
                <DropdownMenuSeparator />

                <DropdownMenuItem
                  onClick={() => handleSendWhatsApp(templates.msgUpdate)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      Atualização (Check-in)
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      Olá {client.name.split(" ")[0]}, seu check-in...
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleSendWhatsApp(templates.msgWelcome)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      Boas-vindas (Novo)
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      Que alegria ter você aqui...
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleSendWhatsApp(templates.msgRenewal)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      Renovação de Pacote
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      Você concluiu a última sessão...
                    </span>
                  </div>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleSendWhatsApp(templates.msgReminder)}
                  className="cursor-pointer py-2"
                >
                  <div className="flex flex-col gap-1">
                    <span className="font-medium text-sm">
                      Lembrete de Agenda
                    </span>
                    <span className="text-[10px] text-muted-foreground line-clamp-1">
                      Passando para lembrar do nosso...
                    </span>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              onClick={handleEmail}
              className="rounded-full flex-1 h-12 text-base border-primary/20"
            >
              <Mail className="mr-2 h-5 w-5 text-primary" /> E-mail
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
