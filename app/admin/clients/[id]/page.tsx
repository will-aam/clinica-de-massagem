"use client"

import { use, useState } from "react"
import useSWR, { mutate } from "swr"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  User,
  Phone,
  CreditCard,
  MessageCircle,
  Plus,
  Trash2,
  CalendarCheck,
  Package,
} from "lucide-react"
import { toast } from "sonner"
import type { Client as ClientType, Package as PackageType, CheckIn } from "@/lib/data"

const fetcher = (url: string) => fetch(url).then(r => r.json())

interface ClientDetailData {
  client: ClientType
  packages: PackageType[]
  checkIns: CheckIn[]
  activePackage: PackageType | null
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { data, isLoading } = useSWR<ClientDetailData>(`/api/clients/${id}`, fetcher)
  const [newSessions, setNewSessions] = useState("10")
  const [addPkgOpen, setAddPkgOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const res = await fetch(`/api/clients/${id}`, { method: "DELETE" })
      if (res.ok) {
        toast.success("Cliente excluído com sucesso!")
        router.push("/admin/clients")
      } else {
        toast.error("Erro ao excluir cliente")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setDeleting(false)
    }
  }

  const handleAddPackage = async () => {
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_sessions: Number(newSessions) }),
      })
      if (res.ok) {
        toast.success("Novo pacote adicionado!")
        setAddPkgOpen(false)
        mutate(`/api/clients/${id}`)
      } else {
        toast.error("Erro ao adicionar pacote")
      }
    } catch {
      toast.error("Erro de conexão")
    }
  }

  const handleWhatsApp = () => {
    if (data?.client.phone_whatsapp) {
      const phone = data.client.phone_whatsapp.replace(/\D/g, "")
      const message = encodeURIComponent(
        `Olá ${data.client.name}! Lembramos que seu pacote de sessões está ativo na Serenità. Agende sua próxima sessão!`
      )
      window.open(`https://wa.me/55${phone}?text=${message}`, "_blank")
      toast.success("Abrindo WhatsApp...")
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Detalhes do Cliente" />
        <div className="flex flex-col gap-6 p-4 md:p-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    )
  }

  if (!data?.client) {
    return (
      <>
        <AdminHeader title="Cliente" />
        <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
          <User className="h-12 w-12 text-muted-foreground/40" />
          <p className="text-muted-foreground">Cliente não encontrado.</p>
          <Button asChild variant="outline">
            <Link href="/admin/clients">Voltar</Link>
          </Button>
        </div>
      </>
    )
  }

  const { client, activePackage, checkIns } = data
  const progress = activePackage
    ? Math.round((activePackage.used_sessions / activePackage.total_sessions) * 100)
    : 0

  return (
    <>
      <AdminHeader title="Detalhes do Cliente" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Link>
        </Button>

        {/* Client Info + Actions */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Info Card */}
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <User className="h-5 w-5 text-primary" />
                {client.name}
              </CardTitle>
              <CardDescription>
                {"Cadastrado em "}
                {new Date(client.created_at).toLocaleDateString("pt-BR")}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm text-foreground">{client.cpf}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-foreground">{client.phone_whatsapp}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={handleWhatsApp} className="text-foreground">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Enviar WhatsApp
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline" className="text-destructive hover:bg-destructive/10">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-foreground">Confirmar exclusão</AlertDialogTitle>
                      <AlertDialogDescription>
                        {"Tem certeza que deseja excluir o cliente "}
                        <strong>{client.name}</strong>
                        {"? Esta ação não pode ser desfeita."}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="text-foreground">Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={deleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {deleting ? "Excluindo..." : "Excluir"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>

          {/* Package Card */}
          <Card className="border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Package className="h-5 w-5 text-primary" />
                  Pacote Atual
                </CardTitle>
                <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Novo Pacote
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-foreground">Adicionar Novo Pacote</DialogTitle>
                      <DialogDescription>
                        Defina o número de sessões do novo pacote para {client.name}.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2 py-4">
                      <Label htmlFor="newSessions" className="text-foreground">Total de Sessões</Label>
                      <Input
                        id="newSessions"
                        type="number"
                        min="1"
                        max="50"
                        value={newSessions}
                        onChange={(e) => setNewSessions(e.target.value)}
                        className="bg-muted text-foreground"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setAddPkgOpen(false)} className="text-foreground">
                        Cancelar
                      </Button>
                      <Button onClick={handleAddPackage}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {activePackage ? (
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-lg font-semibold text-card-foreground">
                      {`Sessão ${activePackage.used_sessions} de ${activePackage.total_sessions}`}
                    </p>
                    <Progress value={progress} className="mt-2 h-4" />
                    <p className="mt-1 text-sm text-muted-foreground">
                      {activePackage.total_sessions - activePackage.used_sessions > 0
                        ? `${activePackage.total_sessions - activePackage.used_sessions} sessões restantes`
                        : "Pacote concluído!"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {"Criado em "}
                    {new Date(activePackage.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Package className="h-10 w-10 text-muted-foreground/40" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Nenhum pacote ativo. Adicione um novo pacote.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Check-in History */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <CalendarCheck className="h-5 w-5 text-primary" />
              {"Histórico de Check-ins"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {checkIns.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarCheck className="h-10 w-10 text-muted-foreground/40" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Nenhum check-in registrado para este cliente.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-muted-foreground">Data</TableHead>
                      <TableHead className="text-muted-foreground">Horário</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {checkIns.map((ci) => (
                      <TableRow key={ci.id}>
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
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
