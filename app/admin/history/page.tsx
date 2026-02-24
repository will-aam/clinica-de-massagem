"use client";

import { useState, useMemo } from "react";
import useSWR from "swr";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ClipboardList, Filter, ArrowUpDown } from "lucide-react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

interface EnrichedCheckIn {
  id: string;
  client_id: string;
  package_id: string;
  date_time: string;
  client_name: string;
  client_cpf: string;
}

// 1. Definição das Colunas
const columns: ColumnDef<EnrichedCheckIn>[] = [
  {
    accessorKey: "client_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-[#D9C6BF]/30 hover:text-foreground text-muted-foreground font-semibold transition-colors"
        >
          Cliente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.getValue("client_name")}
      </div>
    ),
  },
  {
    accessorKey: "client_cpf",
    // Magia para manter o CPF oculto em telas pequenas usando metadata da coluna
    meta: {
      className: "hidden sm:table-cell",
    },
    header: () => (
      <span className="text-muted-foreground font-semibold">CPF</span>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-sm text-muted-foreground">
        {row.getValue("client_cpf")}
      </span>
    ),
  },
  {
    accessorKey: "date_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-[#D9C6BF]/30 hover:text-foreground text-muted-foreground font-semibold transition-colors"
        >
          Data e Hora
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("date_time"));
      const formattedDate = date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const formattedTime = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return (
        <div className="flex flex-col">
          <span className="font-medium text-foreground capitalize">
            {formattedDate}
          </span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
      );
    },
  },
];

// 2. Componente da Data Table Embutida com Paginação Nativa
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(), // Paginação automática
    initialState: {
      pagination: {
        pageSize: 10, // Items por página
      },
    },
    state: {
      sorting,
    },
  });

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border overflow-hidden bg-background">
        <div className="max-h-125 overflow-auto relative custom-scrollbar">
          <table className="w-full text-sm text-left">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-0"
                >
                  {headerGroup.headers.map((header) => {
                    // Recupera a classe customizada (ex: hidden sm:table-cell) se existir
                    const customClass =
                      (header.column.columnDef.meta as any)?.className || "";
                    return (
                      <TableHead
                        key={header.id}
                        className={`sticky top-0 z-10 bg-background before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-border ${customClass}`}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-[#D9C6BF]/20 border-b-border transition-colors"
                  >
                    {row.getVisibleCells().map((cell) => {
                      const customClass =
                        (cell.column.columnDef.meta as any)?.className || "";
                      return (
                        <TableCell key={cell.id} className={customClass}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    Sem resultados para o filtro.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        </div>
      </div>

      {/* Controles de Paginação */}
      {table.getPageCount() > 1 && (
        <div className="flex items-center justify-between px-2">
          <p className="text-sm text-muted-foreground">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-foreground hover:bg-[#D9C6BF]/20"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-foreground hover:bg-[#D9C6BF]/20"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// 3. Página Principal
export default function AdminHistoryPage() {
  const { data: checkIns, isLoading } = useSWR<EnrichedCheckIn[]>(
    "/api/history",
    fetcher,
  );
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Filtro de datas (ocorre antes da tabela processar a paginação e ordenação)
  const filtered = useMemo(() => {
    if (!checkIns) return [];
    return checkIns.filter((ci) => {
      const ciDate = ci.date_time.split("T")[0];
      if (dateFrom && ciDate < dateFrom) return false;
      if (dateTo && ciDate > dateTo) return false;
      return true;
    });
  }, [checkIns, dateFrom, dateTo]);

  const clearFilters = () => {
    setDateFrom("");
    setDateTo("");
  };

  return (
    <>
      <AdminHeader title="Histórico de Check-ins" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* Filtros */}
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
                <Label
                  htmlFor="dateFrom"
                  className="text-xs text-muted-foreground"
                >
                  Data Inicial
                </Label>
                <Input
                  id="dateFrom"
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-muted text-foreground"
                />
              </div>
              <div className="flex flex-col gap-1">
                <Label
                  htmlFor="dateTo"
                  className="text-xs text-muted-foreground"
                >
                  Data Final
                </Label>
                <Input
                  id="dateTo"
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-muted text-foreground"
                />
              </div>
              {(dateFrom || dateTo) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="text-muted-foreground hover:bg-[#D9C6BF]/20 hover:text-foreground"
                >
                  Limpar filtros
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Card da Tabela */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <ClipboardList className="h-5 w-5 text-primary" />
              Todos os Check-ins
              <span className="ml-auto text-sm font-normal text-muted-foreground">
                {filtered.length}{" "}
                {filtered.length === 1 ? "registro" : "registros"}
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
              // Injeção dos dados já filtrados pelo período na nossa DataTable
              <DataTable columns={columns} data={filtered} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
