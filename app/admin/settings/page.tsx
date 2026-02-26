"use client";

import { AdminHeader } from "@/components/admin-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./sections/general-settings";
import { AppearanceSettings } from "./sections/appearance-settings";
import { MessageSettings } from "./sections/message-settings";
import { SecuritySettings } from "./sections/security-settings";
import { NotificationsSettings } from "./sections/notifications-settings";
import {
  Building,
  Palette,
  MessageSquare,
  ShieldCheck,
  Save,
  Bell,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="Configurações do Sistema" />
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
        <Tabs defaultValue="general" className="w-full">
          {/* Ajustamos o grid para caber 5 colunas em telas grandes, e rolar/quebrar em telas pequenas */}
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto bg-muted p-1 gap-1">
            <TabsTrigger value="general" className="flex gap-2 py-2">
              <Building className="h-4 w-4" />
              <span className="hidden sm:inline">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex gap-2 py-2">
              <Palette className="h-4 w-4" />
              <span className="hidden sm:inline">Aparência</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex gap-2 py-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Mensagens</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex gap-2 py-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Notificações</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2 py-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Acesso</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="general">
              <GeneralSettings />
            </TabsContent>

            <TabsContent value="appearance">
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="messages">
              <MessageSettings />
            </TabsContent>

            {/* Injetamos a nova aba de Notificações */}
            <TabsContent value="notifications">
              <NotificationsSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end border-t border-border pt-4 mt-4">
          <Button className="flex gap-2 shadow-sm hover:scale-[1.02] transition-transform">
            <Save className="h-4 w-4" />
            Salvar todas as alterações
          </Button>
        </div>
      </div>
    </>
  );
}
