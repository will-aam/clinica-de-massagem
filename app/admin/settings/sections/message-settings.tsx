"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

export function MessageSettings() {
  const [phone, setPhone] = useState("");
  const [defaultMessage, setDefaultMessage] = useState(
    "Olá, {nome}! Tudo bem? 💆‍♀️✨\n\nPassando para lembrar que o seu pacote na clínica está ativo.\nVocê já realizou {usadas} de {total} sessões.",
  );

  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-card-foreground">
            <MessageSquare className="h-5 w-5 text-primary" />
            Configurações de Comunicação
          </CardTitle>
          <CardDescription>
            Defina o número remetente e os modelos (templates) de mensagens
            padrão.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="phone">Número de WhatsApp da Clínica</Label>
            <Input
              id="phone"
              placeholder="(00) 00000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="max-w-sm"
            />
            <p className="text-xs text-muted-foreground">
              Este é o número que será utilizado para abrir o atalho do WhatsApp
              Web.
            </p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="defaultMessage">
              Mensagem de Atualização de Pacote
            </Label>
            <Textarea
              id="defaultMessage"
              rows={4}
              value={defaultMessage}
              onChange={(e) => setDefaultMessage(e.target.value)}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Variáveis disponíveis:{" "}
              <code className="bg-muted px-1 py-0.5 rounded">{`{nome}`}</code>,{" "}
              <code className="bg-muted px-1 py-0.5 rounded">{`{usadas}`}</code>
              ,{" "}
              <code className="bg-muted px-1 py-0.5 rounded">{`{total}`}</code>.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
