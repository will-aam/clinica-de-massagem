"use client"

import { useState } from "react"
import useSWR from "swr"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Search, Users, Eye } from "lucide-react"
import type { Client } from "@/lib/data"

const fetcher = (url: string) => fetch(url).then(r => r.json())

const ITEMS_PER_PAGE = 5

export default function AdminClientsPage() {
  const { data: clients, isLoading } = useSWR<Client[]>("/api/clients", fetcher)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)

  const filtered = (clients || []).filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.cpf.includes(search)
  )

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <>
      <AdminHeader title="Clientes" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Search & Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome ou CPF..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="bg-card pl-10 text-foreground"
            />
          </div>
          <Button asChild>
            <Link href="/admin/clients/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Link>
          </Button>
        </div>

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Users className="h-5 w-5 text-primary" />
              {"Todos os Clientes"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  {search ? "Nenhum cliente encontrado para essa busca." : "Nenhum cliente cadastrado ainda."}
                </p>
                {!search && (
                  <Button asChild className="mt-4" size="sm">
                    <Link href="/admin/clients/new">
                      <Plus className="mr-2 h-4 w-4" />
                      Cadastrar Primeiro Cliente
                    </Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">CPF</TableHead>
                        <TableHead className="hidden text-muted-foreground sm:table-cell">WhatsApp</TableHead>
                        <TableHead className="text-right text-muted-foreground">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((client) => (
                        <TableRow key={client.id}>
                          <TableCell className="font-medium text-foreground">{client.name}</TableCell>
                          <TableCell className="font-mono text-sm text-muted-foreground">{client.cpf}</TableCell>
                          <TableCell className="hidden text-muted-foreground sm:table-cell">{client.phone_whatsapp}</TableCell>
                          <TableCell className="text-right">
                            <Button asChild variant="ghost" size="sm">
                              <Link href={`/admin/clients/${client.id}`}>
                                <Eye className="mr-1 h-4 w-4" />
                                Ver
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {`Mostrando ${(page - 1) * ITEMS_PER_PAGE + 1}-${Math.min(page * ITEMS_PER_PAGE, filtered.length)} de ${filtered.length}`}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="text-foreground"
                      >
                        Anterior
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="text-foreground"
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
  )
}
