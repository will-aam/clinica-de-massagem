"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileBottomNav } from "@/components/mobile-bottom-nav"; // <-- Nosso novo componente

// Seções
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

// Definimos a lista de menus aqui, de forma limpa, para injetar no componente mobile
const mobileNavItems = [
  { id: "general", label: "Geral", icon: Building },
  { id: "appearance", label: "Visual", icon: Palette },
  { id: "messages", label: "Msg", icon: MessageSquare },
  { id: "notifications", label: "Alertas", icon: Bell },
  { id: "security", label: "Acesso", icon: ShieldCheck },
];

export default function AdminSettingsPage() {
  // Estado que controla qual aba/tela está ativa agora
  const [activeTab, setActiveTab] = useState("general");

  return (
    <>
      <AdminHeader title="Configurações do Sistema" />
      {/* pb-24 adicionado para o botão "Salvar" não ficar escondido atrás da barra inferior no mobile */}
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6 relative">
        {/* Usamos value e onValueChange para controlar as Tabs programaticamente */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Menu Desktop: visível apenas a partir de telas médias (hidden md:grid) */}
          <TabsList className="hidden md:grid w-full grid-cols-5 h-auto bg-muted p-1 gap-1">
            <TabsTrigger value="general" className="flex gap-2 py-2">
              <Building className="h-4 w-4" /> Geral
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex gap-2 py-2">
              <Palette className="h-4 w-4" /> Aparência
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex gap-2 py-2">
              <MessageSquare className="h-4 w-4" /> Mensagens
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex gap-2 py-2">
              <Bell className="h-4 w-4" /> Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="flex gap-2 py-2">
              <ShieldCheck className="h-4 w-4" /> Acesso
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
            <TabsContent value="notifications">
              <NotificationsSettings />
            </TabsContent>
            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end border-t border-border pt-4 mt-4">
          <Button className="flex gap-2 shadow-sm hover:scale-[1.02] transition-transform w-full md:w-auto">
            <Save className="h-4 w-4" />
            Salvar todas as alterações
          </Button>
        </div>
      </div>

      {/* Menu Mobile: Passamos a lista de botões e o estado ativo. 
        Quando o componente de baixo avisa que clicou, nós mudamos a aba ativa.
      */}
      <MobileBottomNav
        items={mobileNavItems}
        activeId={activeTab}
        onChange={setActiveTab}
      />
    </>
  );
}
