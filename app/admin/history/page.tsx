"use client"

import { useState, useMemo } from "react"
import useSWR from "swr"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { ClipboardList, Filter } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface EnrichedCheckIn {
  id: string
  client_id: string
  package_id: string
  date_time: string
  client_name: string
  client_cpf: string
}

const ITEMS_PER_PAGE = 10

export default function AdminHistoryPage() {
  const { data: checkIns, isLoading } = useSWR<EnrichedCheckIn[]>("/api/history", fetcher)
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    if (!checkIns) return []
    return checkIns.filter(ci => {
      const ciDate = ci.date_time.split("T")[0]
      if (dateFrom && ciDate < dateFrom) return false
      if (dateTo && ciDate > dateTo) return false
      return true
    })
  }, [checkIns, dateFrom, dateTo])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const clearFilters = () => {
    setDateFrom("")
    setDateTo("")
    setPage(1)
  }

  return (
    <>
      <AdminHeader title="Histórico de Check-ins" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Filters */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm text-card-foreground">
              <Filter className="h-4 w-4 text-primary" />
              Filtrar por período
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateFrom" className="text-xs text-muted-foreground">Data Inicial</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setPage(1) }}
                  className="bg-muted text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label htmlFor="dateTo" className="text-xs text-muted-foreground">Data Final</Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setPage(1) }}
                  className="bg-muted text-foreground"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              {"Todos os Check-ins"}
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {filtered.length} {filtered.length === 1 ? "registro" : "registros"}
              </span>
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
                <ClipboardList className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum check-in encontrado para o período selecionado.
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-muted-foreground">Cliente</TableHead>
                        <TableHead className="hidden text-muted-foreground sm:table-cell">CPF</TableHead>
                        <TableHead className="text-muted-foreground">Data</TableHead>
                        <TableHead className="text-muted-foreground">Horário</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginated.map((ci) => (
                        <TableRow key={ci.id}>
                          <TableCell className="font-medium text-foreground">{ci.client_name}</TableCell>
                          <TableCell className="hidden font-mono text-sm text-muted-foreground sm:table-cell">
                            {ci.client_cpf}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(ci.date_time).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell className="text-muted-foreground">
                            {new Date(ci.date_time).toLocaleTimeString("pt-BR", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      {`Página ${page} de ${totalPages}`}
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
