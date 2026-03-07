"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Search, Users, Eye, ChevronRight } from "lucide-react";

// 🔥 Tipo atualizado para receber o nome do pacote
type Client = {
  id: string;
  name: string;
  cpf: string;
  phone_whatsapp: string;
  activePackageName?: string | null;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ITEMS_PER_PAGE = 5;

// COMPONENTE: Item da Lista para Mobile
function ClientMobileItem({ client }: { client: Client }) {
  const initial = client.name.charAt(0).toUpperCase();

  return (
    <Link
      href={`/admin/clients/${client.id}`}
      className="flex items-center justify-between py-3 px-2 -mx-2 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm border border-primary/20">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-none mb-1.5 flex items-center gap-1.5">
            {client.name}
          </span>
          <span className="text-xs text-muted-foreground leading-none font-mono">
            {client.cpf}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2 text-muted-foreground/50">
        {/* 🔥 Nome do pacote no mobile em uma tag discreta e truncada */}
        {client.activePackageName && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md truncate max-w-25">
            {client.activePackageName}
          </span>
        )}
        <ChevronRight className="h-5 w-5 shrink-0" />
      </div>
    </Link>
  );
}

export default function AdminClientsPage() {
  const { data: clients, isLoading } = useSWR<Client[]>(
    "/api/clients",
    fetcher,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = (clients || []).filter((c) => {
    const term = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(term) ||
      c.cpf.includes(term) ||
      (c.phone_whatsapp && c.phone_whatsapp.includes(term))
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE,
  );

  return (
    <>
      <AdminHeader title="Clientes" />
      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 md:pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, CPF ou telefone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="bg-card pl-10 text-foreground rounded-full md:rounded-md shadow-sm border-border"
            />
          </div>
          <Button
            asChild
            className="rounded-full md:rounded-md shadow-sm w-full sm:w-auto"
          >
            <Link href="/admin/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6">
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              Todos os Clientes
            </CardTitle>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-full shrink-0 md:rounded-md" />
                    <div className="flex flex-col gap-2 w-full">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border border-dashed border-border">
                <Users className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">
                  {search
                    ? "Nenhum cliente encontrado para essa busca."
                    : "Nenhum cliente cadastrado ainda."}
                </p>
                {!search && (
                  <Button
                    asChild
                    className="mt-4 rounded-full md:rounded-md"
                    size="sm"
                  >
                    <Link href="/admin/clients/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Primeiro Cliente
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="flex flex-col md:hidden">
                  {paginated.map((client) => (
                    <ClientMobileItem key={client.id} client={client} />
                  ))}
                </div>

                <div className="hidden md:block overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="text-muted-foreground font-semibold">
                          Cliente
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold">
                          CPF
                        </TableHead>
                        <TableHead className="text-muted-foreground font-semibold">
                          WhatsApp
                        </TableHead>
                        <TableHead className="text-center text-muted-foreground font-semibold">
                          Plano / Pacote
                        </TableHead>
                        <TableHead className="text-center text-muted-foreground font-semibold w-24">
                          Ações
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((client) => (
                        <TableRow
                          key={client.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <TableCell className="font-medium text-foreground">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                                {client.name.charAt(0).toUpperCase()}
                              </div>
                              {client.name}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">
                            {client.cpf}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {client.phone_whatsapp}
                          </TableCell>

                          {/* 🔥 Nome do pacote no desktop */}
                          <TableCell className="text-center">
                            {client.activePackageName ? (
                              <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                {client.activePackageName}
                              </span>
                            ) : (
                              <span className="text-muted-foreground/50">
                                -
                              </span>
                            )}
                          </TableCell>

                          <TableCell className="text-center">
                            <Link
                              href={`/admin/clients/${client.id}`}
                              className="inline-flex p-2 text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-full transition-colors active:scale-95"
                              title="Ver Perfil"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4">
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                      {`Mostrando ${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, filtered.length)} de ${filtered.length}`}
                    </p>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage((p) => p - 1)}
                        className="text-foreground w-full sm:w-auto rounded-full md:rounded-md"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage((p) => p + 1)}
                        className="text-foreground w-full sm:w-auto rounded-full md:rounded-md"
                      >
                        Próximo
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
