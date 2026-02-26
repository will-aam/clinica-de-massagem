"use client";
// O FUTURO DA SUA PAGE (Server Component nativo, super rápido e amigável para SEO), quando a sua page.tsx virar um Server Component, ela vai apenas repassar os dados para esses botões e modais interativos. A tela carregará de forma instantânea (Server Side Rendering), mas os botões continuarão funcionando perfeitamente no celular do usuário.

import { use } from "react";
import useSWR from "swr";
import Link from "next/link";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "lucide-react";
import type {
  Client as ClientType,
  Package as PackageType,
  CheckIn,
} from "@/lib/data";

// Importando os nossos novos blocos arquiteturais
import { ClientHeader } from "@/components/client/client-header";
import { ClientContact } from "@/components/client/client-contact";
import { ClientPackage } from "@/components/client/client-package";
import { ClientHistory } from "@/components/client/client-history";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface ClientDetailData {
  client: ClientType;
  packages: PackageType[];
  checkIns: CheckIn[];
  activePackage: PackageType | null;
}

export default function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // A requisição SWR centralizada
  const { data, isLoading } = useSWR<ClientDetailData>(
    `/api/clients/${id}`,
    fetcher,
  );

  // --- ESTADOS DE CARREGAMENTO & ERRO ---
  if (isLoading) {
    return (
      <>
        <AdminHeader title="Perfil do Cliente" />
        <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-64 md:col-span-2 rounded-xl" />
            <Skeleton className="h-64 md:col-span-1 rounded-xl" />
          </div>
        </div>
      </>
    );
  }

  if (!data?.client) {
    return (
      <>
        <AdminHeader title="Cliente" />
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center h-[80vh]">
          <User className="h-16 w-16 text-muted-foreground/30" />
          <p className="text-lg font-medium text-muted-foreground">
            Cliente não encontrado.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/admin/clients">Voltar para a lista</Link>
          </Button>
        </div>
      </>
    );
  }

  // --- RENDERIZAÇÃO LIMPA E MODULAR ---
  const { client, activePackage, checkIns } = data;

  return (
    <>
      <AdminHeader title="Perfil do Cliente" />

      <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
        {/* Bloco 1: Cabeçalho */}
        <ClientHeader client={client} />

        {/* Bloco 2: Grid Principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <ClientContact client={client} activePackage={activePackage} />
          <ClientPackage
            clientId={id}
            clientName={client.name}
            activePackage={activePackage}
          />
        </div>

        {/* Bloco 3: Histórico */}
        <ClientHistory checkIns={checkIns} />
      </div>
    </>
  );
}
