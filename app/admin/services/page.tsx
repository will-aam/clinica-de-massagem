"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Sparkles, Package, FolderOpen } from "lucide-react";

export default function ServicesCatalogPage() {
  // Pega a aba da URL se existir (ex: /admin/services?tab=packages)
  const searchParams = useSearchParams();
  const defaultTab = searchParams.get("tab") || "services";

  return (
    <>
      <AdminHeader title="Catálogo" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 md:pb-6">
        <Tabs defaultValue={defaultTab} className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <TabsList className="grid w-full md:w-100 grid-cols-2">
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" /> Serviços
              </TabsTrigger>
              <TabsTrigger value="packages" className="flex items-center gap-2">
                <Package className="h-4 w-4" /> Pacotes
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ABA 1: LISTA DE SERVIÇOS */}
          <TabsContent value="services" className="mt-0">
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
                      Cadastrar Primeiro Serviço
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ABA 2: LISTA DE PACOTES */}
          <TabsContent value="packages" className="mt-0">
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
                      Cadastrar Primeiro Pacote
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
