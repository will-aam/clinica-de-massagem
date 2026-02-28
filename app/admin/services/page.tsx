"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { Plus, Cog, Package, FolderOpen, Tags, Clock } from "lucide-react";

// Definimos a lista de menus para o mobile
const mobileNavItems = [
  { id: "services", label: "Serviços", icon: Cog },
  { id: "packages", label: "Pacotes", icon: Package },
  { id: "categories", label: "Categorias", icon: Tags },
  { id: "schedules", label: "Horários", icon: Clock },
];

// Componente isolado para poder usar o useSearchParams com o Suspense
function ServicesTabs() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "services";

  // Estado que controla qual aba/tela está ativa agora
  const [activeTab, setActiveTab] = useState(initialTab);

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Menu Desktop: visível apenas a partir de telas médias (hidden md:grid) */}
          <TabsList className="hidden md:grid w-full lg:w-150 grid-cols-4 h-auto gap-1 bg-muted p-1">
            <TabsTrigger
              value="services"
              className="flex items-center gap-2 py-2"
            >
              <Cog className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">Serviços</span>
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="flex items-center gap-2 py-2"
            >
              <Package className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">Pacotes</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 py-2"
            >
              <Tags className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">Categorias</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="flex items-center gap-2 py-2"
            >
              <Clock className="h-4 w-4 shrink-0" />{" "}
              <span className="truncate">Horários</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* ABA 1: LISTA DE SERVIÇOS */}
        <TabsContent value="services" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                <FolderOpen className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  Nenhum serviço cadastrado
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6">
                  Cadastre os procedimentos que você oferece para
                  disponibilizá-los no agendamento e financeiro.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full shadow-sm hover:scale-105 transition-all"
                >
                  <Link href="/admin/services/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Serviço
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: LISTA DE PACOTES */}
        <TabsContent value="packages" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                <Package className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  Nenhum pacote cadastrado
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6">
                  Crie planos ou combos mensais de sessões para fidelizar seus
                  clientes.
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full shadow-sm hover:scale-105 transition-all"
                >
                  <Link href="/admin/packages/new">
                    <Plus className="mr-2 h-5 w-5" />
                    Novo Pacote
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CATEGORIAS */}
        <TabsContent value="categories" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                <Tags className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  Nenhuma categoria
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6">
                  Crie grupos (ex: Massagens, Estética Facial) para organizar
                  seus serviços na agenda.
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full shadow-sm hover:bg-muted"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Nova Categoria
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 4: HORÁRIOS */}
        <TabsContent value="schedules" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                <Clock className="h-12 w-12 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground">
                  Configuração de Horários
                </h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6">
                  Defina seus dias e turnos de atendimento para o sistema montar
                  os horários disponíveis.
                </p>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full shadow-sm hover:bg-muted"
                >
                  <Clock className="mr-2 h-5 w-5" />
                  Configurar Turnos
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Menu Mobile injetado aqui, repassando o controle do estado */}
      <MobileBottomNav
        items={mobileNavItems}
        activeId={activeTab}
        onChange={setActiveTab}
      />
    </>
  );
}

export default function ServicesCatalogPage() {
  return (
    <>
      <AdminHeader title="Catálogo e Configurações" />

      {/* O pb-24 e pb-32 garantem que o conteúdo não fique escondido atrás do MobileBottomNav no celular */}
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-32 md:pb-6 relative">
        <Suspense
          fallback={
            <div className="flex justify-center p-12 text-muted-foreground">
              Carregando catálogo...
            </div>
          }
        >
          <ServicesTabs />
        </Suspense>
      </div>
    </>
  );
}
