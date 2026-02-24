"use client"

import useSWR from "swr"
import { AdminHeader } from "@/components/admin-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { CalendarCheck, Users, AlertTriangle, Clock } from "lucide-react"

const fetcher = (url: string) => fetch(url).then(r => r.json())

function KpiCard({ title, value, description, icon: Icon }: {
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <Card className="border-border">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold text-card-foreground">{value}</div>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useSWR("/api/dashboard", fetcher, {
    refreshInterval: 15000,
  })

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
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Cliente</TableHead>
                      <TableHead className="text-muted-foreground">Data/Hora</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data?.recentCheckIns?.map((ci: { id: string; client_name: string; date_time: string }) => (
                      <TableRow key={ci.id}>
                        <TableCell className="font-medium text-foreground">{ci.client_name}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(ci.date_time).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
