import { AdminHeader } from "@/components/admin-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GeneralSettings } from "./sections/general-settings";
import { AppearanceSettings } from "./sections/appearance-settings"; // Vamos criar em seguida
import { MessageSettings } from "./sections/message-settings"; // Vamos criar em seguida
import { SecuritySettings } from "./sections/security-settings"; // Vamos criar em seguida
import {
  Building,
  Palette,
  MessageSquare,
  ShieldCheck,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  return (
    <>
      <AdminHeader title="Configurações do Sistema" />
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-4xl">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto bg-muted p-1">
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
              {/* O componente de tema que você já tem será movido para cá */}
              <AppearanceSettings />
            </TabsContent>

            <TabsContent value="messages">
              <MessageSettings />
            </TabsContent>

            <TabsContent value="security">
              <SecuritySettings />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end border-t pt-4">
          <Button className="flex gap-2">
            <Save className="h-4 w-4" />
            Salvar todas as alterações
          </Button>
        </div>
      </div>
    </>
  );
}
