"use client";

import { useState } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, CalendarCheck } from "lucide-react";
import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";

export interface EnrichedCheckIn {
  id: string;
  client_id: string;
  package_id: string;
  date_time: string;
  client_name: string;
  client_cpf: string;
}

function MobileHistoryItem({ checkIn }: { checkIn: EnrichedCheckIn }) {
  const date = new Date(checkIn.date_time);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const initial = checkIn.client_name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center justify-between py-3 px-2 -mx-2 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold shadow-sm border border-primary/20">
          {initial}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-foreground leading-none mb-1.5">
            {checkIn.client_name}
          </span>
          <span className="text-xs text-muted-foreground leading-none capitalize">
            {formattedDate}
          </span>
        </div>
      </div>
      <span className="text-sm font-medium text-foreground bg-muted px-2 py-1 rounded-md">
        {formattedTime}
      </span>
    </div>
  );
}

const columns: ColumnDef<EnrichedCheckIn>[] = [
  {
    accessorKey: "client_name",
    header: ({ column }) => (
      // REMOVIDO o -ml-4 e adicionado px-2 para dar espaço das bordas
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-2 hover:bg-muted hover:text-foreground text-muted-foreground font-semibold transition-colors rounded-full"
      >
        Cliente <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      // Adicionado px-2 aqui também para alinhar o conteúdo com o título
      <div className="flex items-center gap-3 font-medium text-foreground px-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
          {row.original.client_name.charAt(0).toUpperCase()}
        </div>
        {row.getValue("client_name")}
      </div>
    ),
  },
  {
    accessorKey: "client_cpf",
    meta: { className: "hidden sm:table-cell" },
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
    header: ({ column }) => (
      // REMOVIDO o -ml-4
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="px-2 hover:bg-muted hover:text-foreground text-muted-foreground font-semibold transition-colors rounded-full"
      >
        Data e Hora <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
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
        <div className="flex flex-col px-2">
          <span className="font-medium text-foreground capitalize">
            {formattedDate}
          </span>
          <span className="text-xs text-muted-foreground">{formattedTime}</span>
        </div>
      );
    },
  },
];

export function HistoryTable({ data }: { data: EnrichedCheckIn[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "date_time", desc: true },
  ]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
    state: { sorting },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:hidden">
        {table.getRowModel().rows.map((row) => (
          <MobileHistoryItem
            key={row.id}
            checkIn={row.original as EnrichedCheckIn}
          />
        ))}
      </div>

      <div className="hidden md:block rounded-md border border-border overflow-hidden bg-background">
        <div className="max-h-150 overflow-auto relative custom-scrollbar">
          <table className="w-full text-sm text-left">
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="hover:bg-transparent border-0"
                >
                  {headerGroup.headers.map((header) => {
                    const customClass =
                      (header.column.columnDef.meta as any)?.className || "";
                    return (
                      <TableHead
                        key={header.id}
                        className={`sticky top-0 z-10 bg-muted/50 before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-border ${customClass}`}
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
              {table.getRowModel().rows?.length
                ? table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      className="hover:bg-muted/30 border-b-border transition-colors group"
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
                : null}
            </TableBody>
          </table>
        </div>
      </div>

      {table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border pt-4 mt-4">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
            Página {table.getState().pagination.pageIndex + 1} de{" "}
            {table.getPageCount()}
          </p>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="w-full sm:w-auto rounded-full"
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="w-full sm:w-auto rounded-full"
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
