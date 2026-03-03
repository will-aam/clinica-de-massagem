"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { MobileBottomNav } from "@/components/mobile-bottom-nav";
import { DurationManager } from "@/components/service-durations/duration-manager";
import {
  Plus,
  Cog,
  Package,
  FolderOpen,
  Tags,
  Clock,
  Loader2,
  Layers,
  CalendarDays,
} from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Service = {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  price: number;
  category: {
    id: string;
    name: string;
  };
};

type PackageTemplate = {
  id: string;
  name: string;
  description: string | null;
  total_sessions: number;
  price: number;
  validity_days: number | null;
  is_active: boolean;
};

type Category = {
  id: string;
  name: string;
  _count: {
    services: number;
  };
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

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
  const [activeTab, setActiveTab] = useState(initialTab);

  // 🔥 Busca dados das APIs
  const { data: services, isLoading: loadingServices } = useSWR<Service[]>(
    "/api/services",
    fetcher,
  );

  const { data: packages, isLoading: loadingPackages } = useSWR<
    PackageTemplate[]
  >("/api/package-templates", fetcher);

  const { data: categories, isLoading: loadingCategories } = useSWR<Category[]>(
    "/api/categories",
    fetcher,
  );

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          {/* Menu Desktop */}
          <TabsList className="hidden md:grid w-full lg:w-150 grid-cols-4 h-auto gap-1 bg-muted p-1">
            <TabsTrigger
              value="services"
              className="flex items-center gap-2 py-2"
            >
              <Cog className="h-4 w-4 shrink-0" />
              <span className="truncate">Serviços</span>
            </TabsTrigger>
            <TabsTrigger
              value="packages"
              className="flex items-center gap-2 py-2"
            >
              <Package className="h-4 w-4 shrink-0" />
              <span className="truncate">Pacotes</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-2 py-2"
            >
              <Tags className="h-4 w-4 shrink-0" />
              <span className="truncate">Categorias</span>
            </TabsTrigger>
            <TabsTrigger
              value="schedules"
              className="flex items-center gap-2 py-2"
            >
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">Horários</span>
            </TabsTrigger>
          </TabsList>

          {/* 🔥 Botões dinâmicos baseados na aba ativa */}
          {activeTab === "services" && (
            <Button
              asChild
              size="default"
              className="rounded-full md:rounded-md shadow-sm shrink-0"
            >
              <Link href="/admin/services/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Serviço
              </Link>
            </Button>
          )}

          {activeTab === "packages" && (
            <Button
              asChild
              size="default"
              className="rounded-full md:rounded-md shadow-sm shrink-0"
            >
              <Link href="/admin/packages/new">
                <Plus className="mr-2 h-4 w-4" />
                Novo Pacote
              </Link>
            </Button>
          )}
        </div>

        {/* ABA 1: LISTA DE SERVIÇOS */}
        <TabsContent value="services" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              {loadingServices ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Carregando serviços...</p>
                </div>
              ) : !services || services.length === 0 ? (
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
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <Link
                      key={service.id}
                      href={`/admin/services/${service.id}`}
                      className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {service.name}
                        </h3>
                        <Badge
                          variant="outline"
                          className="text-[10px] shrink-0"
                        >
                          {service.category.name}
                        </Badge>
                      </div>
                      {service.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {service.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          {formatDuration(service.duration)}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(Number(service.price))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 2: LISTA DE PACOTES */}
        <TabsContent value="packages" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              {loadingPackages ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Carregando pacotes...</p>
                </div>
              ) : !packages || packages.length === 0 ? (
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
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {packages.map((pkg) => (
                    <Link
                      key={pkg.id}
                      href={`/admin/packages/${pkg.id}`}
                      className="group flex flex-col gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 hover:border-primary/50 transition-all active:scale-[0.98]"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                          {pkg.name}
                        </h3>
                        <Badge
                          variant={pkg.is_active ? "default" : "secondary"}
                          className="text-[10px] shrink-0"
                        >
                          {pkg.is_active ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                      {pkg.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {pkg.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3 w-3" />
                          {pkg.total_sessions} sessões
                        </span>
                        {pkg.validity_days && (
                          <span className="flex items-center gap-1">
                            <CalendarDays className="h-3 w-3" />
                            {pkg.validity_days} dias
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <span className="text-xs text-muted-foreground">
                          Preço total
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {formatCurrency(Number(pkg.price))}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABA 3: CATEGORIAS */}
        <TabsContent value="categories" className="mt-0 outline-none">
          <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
            <CardContent className="p-6">
              {loadingCategories ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-8 w-8 animate-spin mb-4" />
                  <p className="text-sm">Carregando categorias...</p>
                </div>
              ) : !categories || categories.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-xl border border-dashed border-border">
                  <Tags className="h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-semibold text-foreground">
                    Nenhuma categoria
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground max-w-sm mb-6">
                    As categorias são criadas automaticamente quando você
                    cadastra serviços.
                  </p>
                  <Button
                    asChild
                    size="lg"
                    variant="outline"
                    className="rounded-full shadow-sm hover:bg-muted"
                  >
                    <Link href="/admin/services/new">
                      <Plus className="mr-2 h-5 w-5" />
                      Cadastrar Primeiro Serviço
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-4 rounded-xl border border-border bg-card hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Tags className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">
                            {category.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {category._count.services}{" "}
                            {category._count.services === 1
                              ? "serviço"
                              : "serviços"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules" className="mt-0 outline-none">
          <DurationManager />
        </TabsContent>
      </Tabs>

      {/* Menu Mobile injetado aqui */}
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
