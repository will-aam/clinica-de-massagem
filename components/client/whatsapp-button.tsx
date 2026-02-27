// components/client/whatsapp-button.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface WhatsAppButtonProps {
  clientName: string;
  clientPhone: string;
  usedSessions?: number;
  totalSessions?: number;
}

export function WhatsAppButton({
  clientName,
  clientPhone,
  usedSessions = 0,
  totalSessions = 10,
}: WhatsAppButtonProps) {
  const [templates, setTemplates] = useState({
    phone: "",
    msgUpdate:
      "Olá, {nome}! Tudo bem? 💆‍♀️✨\n\nPassando para avisar que seu check-in foi registrado. Você já realizou {usadas} de {total} sessões do seu pacote.",
    msgWelcome:
      "Olá, {nome}! Que alegria ter você aqui na nossa empresa. 🥰\n\nSeu pacote de {total} sessões já está ativo no nosso sistema. Qualquer dúvida, é só chamar!",
    msgRenewal:
      "Parabéns, {nome}! 🎉 Você concluiu hoje a última sessão do seu pacote.\n\nComo o seu bem-estar é nossa prioridade, que tal já deixarmos o seu próximo pacote garantido? Responda SIM para vermos os horários!",
    msgReminder:
      "Oi, {nome}! Passando para lembrar do nosso horário agendado para amanhã às {horario}. \n\nPodemos confirmar sua presença? 👍",
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

  // Limpa o número de telefone (remove espaços, parênteses e traços)
  const cleanPhone = (phone: string) => {
    return phone.replace(/\D/g, "");
  };

  // Função mágica que troca as variáveis pelo texto real
  const formatMessage = (template: string) => {
    return template
      .replace(/{nome}/g, clientName.split(" ")[0]) // Pega só o primeiro nome
      .replace(/{usadas}/g, usedSessions.toString())
      .replace(/{total}/g, totalSessions.toString())
      .replace(/{horario}/g, "09:00"); // Horário fixo por enquanto, até termos a agenda
  };

  const handleSend = (templateText: string) => {
    const message = formatMessage(templateText);
    const targetPhone = cleanPhone(clientPhone);

    // Se o cliente não tiver telefone cadastrado, não faz nada
    if (!targetPhone) {
      alert("Este cliente não tem um número de WhatsApp cadastrado válido.");
      return;
    }

    // Formata a URL do WhatsApp com o texto codificado (para aceitar espaços e quebras de linha)
    // Usamos api.whatsapp.com para funcionar tanto no PC quanto no celular
    const whatsappUrl = `https://api.whatsapp.com/send?phone=55${targetPhone}&text=${encodeURIComponent(message)}`;

    // Abre em uma nova aba
    window.open(whatsappUrl, "_blank");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-emerald-500/20 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 bg-emerald-50/50"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Enviar Mensagem</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleSend(templates.msgUpdate)}
          className="cursor-pointer"
        >
          <span className="flex-1">Atualização de Pacote</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSend(templates.msgWelcome)}
          className="cursor-pointer"
        >
          <span className="flex-1">Boas-vindas</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSend(templates.msgRenewal)}
          className="cursor-pointer"
        >
          <span className="flex-1">Renovação de Pacote</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => handleSend(templates.msgReminder)}
          className="cursor-pointer"
        >
          <span className="flex-1">Lembrete de Agendamento</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
