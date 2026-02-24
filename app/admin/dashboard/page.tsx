"use client";

import { useState } from "react";
import useSWR from "swr";
import { AdminHeader } from "@/components/admin-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"; // Removemos o "Table" daqui e usamos o nativo
import { Skeleton } from "@/components/ui/skeleton";
import {
  CalendarCheck,
  Users,
  AlertTriangle,
  Clock,
  ArrowUpDown,
} from "lucide-react";

import {
  ColumnDef,
  SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-card-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

// 1. Definição do Tipo e das Colunas da Data Table
type CheckIn = {
  id: string;
  client_name: string;
  date_time: string;
};

const columns: ColumnDef<CheckIn>[] = [
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
    accessorKey: "date_time",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="-ml-4 hover:bg-[#D9C6BF]/30 hover:text-foreground text-muted-foreground font-semibold transition-colors"
        >
          Data do Check-in
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

// 2. Componente Reutilizável da Data Table
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
    state: {
      sorting,
    },
  });

  return (
    <div className="rounded-md border border-border overflow-hidden bg-background">
      <div className="max-h-100 overflow-auto relative custom-scrollbar">
        {/* Substituímos o componente <Table> nativo para o sticky funcionar corretamente */}
        <table className="w-full text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="hover:bg-transparent border-0"
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      // Magia do Sticky: Fixa o cabeçalho no topo e desenha a borda por baixo usando before:
                      className="sticky top-0 z-10 bg-background before:absolute before:bottom-0 before:left-0 before:right-0 before:h-px before:bg-border"
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
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </table>
      </div>
    </div>
  );
}

// 3. Página Principal
export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 15000,
  });

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            <>
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
              <Skeleton className="h-32 rounded-xl" />
            </>
          ) : (
            <>
              <KpiCard
                title="Check-ins Hoje"
                value={data?.todayCheckInsCount ?? 0}
                description="Sessões realizadas hoje"
                icon={CalendarCheck}
              />
              <KpiCard
                title="Clientes Ativos"
                value={data?.activeClientsCount ?? 0}
                description="Com pacotes em andamento"
                icon={Users}
              />
              <KpiCard
                title="Pacotes Finalizando"
                value={data?.packagesEndingSoonCount ?? 0}
                description="Restam 2 ou menos sessões"
                icon={AlertTriangle}
              />
            </>
          )}
        </div>

        {/* Recent Check-ins */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Clock className="h-5 w-5 text-primary" />
              Check-ins Recentes
            </CardTitle>
            <CardDescription>Os últimos registros de presença</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : data?.recentCheckIns?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <CalendarCheck className="h-12 w-12 text-muted-foreground/40" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Nenhum check-in registrado ainda.
                </p>
              </div>
            ) : (
              <DataTable columns={columns} data={data?.recentCheckIns || []} />
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
