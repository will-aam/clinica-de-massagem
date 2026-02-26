"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

export function SecuritySettings() {
  const [email, setEmail] = useState("admin@totten.com");

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Acesso e Segurança
        </CardTitle>
        <CardDescription>
          Faça a gestão das credenciais de acesso ao painel de administração.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">E-mail de Acesso</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="max-w-sm"
          />
        </div>

        <div className="grid gap-4 pt-4 border-t">
          <h3 className="font-medium text-sm">Alterar Palavra-passe</h3>
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl">
            <div className="grid gap-2">
              <Label htmlFor="new-password">Nova Palavra-passe</Label>
              <Input id="new-password" type="password" placeholder="••••••••" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirm-password">
                Confirmar Nova Palavra-passe
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
