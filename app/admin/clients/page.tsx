"use client";

import { useState } from "react";
import useSWR from "swr";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
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
import {
  Plus,
  Search,
  Users,
  ChevronRight,
  Trash2,
  UserMinus,
} from "lucide-react";

// 🔥 Importando o AlertDialog do shadcn/ui
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type Client = {
  id: string;
  name: string;
  cpf: string;
  phone_whatsapp: string;
  activePackageName?: string | null;
  hasHistory?: boolean;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ITEMS_PER_PAGE = 5;

function ClientMobileItem({
  client,
  onClick,
  onDelete,
}: {
  client: Client;
  onClick: () => void;
  onDelete: (c: Client, e: React.MouseEvent) => void;
}) {
  const initial = client.name.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className="flex items-center justify-between py-3 px-2 -mx-2 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors active:scale-[0.98] cursor-pointer"
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
        {client.activePackageName && (
          <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-md truncate max-w-25">
            {client.activePackageName}
          </span>
        )}

        <button
          onClick={(e) => onDelete(client, e)}
          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors active:scale-95"
          title={client.hasHistory ? "Desativar Cliente" : "Excluir Cliente"}
        >
          {client.hasHistory ? (
            <UserMinus className="h-4 w-4" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
        <ChevronRight className="h-5 w-5 shrink-0" />
      </div>
    </div>
  );
}

export default function AdminClientsPage() {
  const {
    data: clients,
    isLoading,
    mutate,
  } = useSWR<Client[]>("/api/clients", fetcher);
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  // 🔥 Estados para controlar o modal do shadcn/ui
  const [clientToProcess, setClientToProcess] = useState<Client | null>(null);

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

  // 🔥 Agora apenas abre o modal e guarda quem foi clicado
  const handleDeleteClick = (client: Client, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setClientToProcess(client);
  };

  // 🔥 Função que efetivamente faz a chamada à API quando confirmado no modal
  const confirmProcess = async () => {
    if (!clientToProcess) return;

    const actionText = clientToProcess.hasHistory ? "desativar" : "excluir";

    try {
      const res = await fetch(`/api/clients/${clientToProcess.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Erro na requisição");

      toast.success(
        clientToProcess.hasHistory
          ? "Cliente desativado com sucesso!"
          : "Cliente excluído com sucesso!",
      );
      mutate();
    } catch (error) {
      toast.error(`Erro ao ${actionText} o cliente.`);
    } finally {
      // Fecha o modal ao terminar
      setClientToProcess(null);
    }
  };

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
                    <ClientMobileItem
                      key={client.id}
                      client={client}
                      onClick={() => router.push(`/admin/clients/${client.id}`)}
                      onDelete={handleDeleteClick} // 🔥 Usa a nova função
                    />
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
                          onClick={() =>
                            router.push(`/admin/clients/${client.id}`)
                          }
                          className="hover:bg-muted/30 transition-colors cursor-pointer"
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
                            <button
                              onClick={(e) => handleDeleteClick(client, e)} // 🔥 Usa a nova função
                              className="inline-flex p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full transition-colors active:scale-95"
                              title={
                                client.hasHistory
                                  ? "Desativar Cliente"
                                  : "Excluir Cliente"
                              }
                            >
                              {client.hasHistory ? (
                                <UserMinus className="h-5 w-5" />
                              ) : (
                                <Trash2 className="h-5 w-5" />
                              )}
                            </button>
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

      {/* 🔥 Modal de Confirmação Shadcn/ui */}
      <AlertDialog
        open={!!clientToProcess}
        onOpenChange={(open) => !open && setClientToProcess(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {clientToProcess?.hasHistory
                ? "Desativar Cliente"
                : "Excluir Cliente"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {clientToProcess?.hasHistory
                ? `Tem certeza que deseja desativar o cliente ${clientToProcess.name}? Ele não aparecerá mais nas listas, mas seu histórico (agendamentos e pacotes) será mantido para consultas futuras.`
                : `Tem certeza que deseja excluir o cliente ${clientToProcess?.name} definitivamente? Esta ação não pode ser desfeita e os dados serão removidos do banco.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmProcess}
              className={
                clientToProcess?.hasHistory
                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                  : "bg-destructive hover:bg-destructive/90"
              }
            >
              {clientToProcess?.hasHistory ? "Sim, desativar" : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
