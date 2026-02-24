"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, Building, MessageCircle, Palette } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [clinicName, setClinicName] = useState("clinica");
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleSave = () => {
    toast.success("Configurações salvas com sucesso!");
  };

  return (
    <>
      <AdminHeader title="Configurações" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Clinic Info */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Building className="h-5 w-5 text-primary" />
              Dados da Clínica
            </CardTitle>
            <CardDescription>
              Informações gerais sobre o estabelecimento
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="clinicName" className="text-card-foreground">
                Nome da Clínica
              </Label>
              <Input
                id="clinicName"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="max-w-sm bg-muted text-foreground"
              />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <MessageCircle className="h-5 w-5 text-primary" />
              Integração WhatsApp
            </CardTitle>
            <CardDescription>
              Configure a integração com API do WhatsApp
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="font-medium text-card-foreground">
                  Notificações WhatsApp
                </p>
                <p className="text-sm text-muted-foreground">
                  Envie lembretes automáticos para os clientes
                </p>
              </div>
              <Switch
                checked={whatsappEnabled}
                onCheckedChange={setWhatsappEnabled}
              />
            </div>

            {whatsappEnabled && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="whatsappToken" className="text-card-foreground">
                  Token da API
                </Label>
                <Input
                  id="whatsappToken"
                  type="password"
                  placeholder="Seu token de acesso"
                  className="max-w-sm bg-muted text-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  Configure o token na sua conta do WhatsApp Business API
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Theme */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Palette className="h-5 w-5 text-primary" />
              Aparência
            </CardTitle>
            <CardDescription>
              Personalize a aparência do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <button
                onClick={() => setTheme("light")}
                className={`flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 transition-all ${
                  theme === "light"
                    ? "border-primary bg-card"
                    : "border-border bg-muted"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-[#F2E7DC]" />
                <span className="mt-1 text-xs text-foreground">Claro</span>
              </button>
              <button
                onClick={() => setTheme("dark")}
                className={`flex h-20 w-20 flex-col items-center justify-center rounded-lg border-2 transition-all ${
                  theme === "dark"
                    ? "border-primary bg-card"
                    : "border-border bg-muted"
                }`}
              >
                <div className="h-8 w-8 rounded-full bg-[#3D2C24]" />
                <span className="mt-1 text-xs text-foreground">Escuro</span>
              </button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end">
          <Button size="lg" onClick={handleSave}>
            <Settings className="mr-2 h-4 w-4" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </>
  );
}
