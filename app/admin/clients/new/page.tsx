"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { AdminHeader } from "@/components/admin-header"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, UserPlus } from "lucide-react"
import { toast } from "sonner"
import Link from "next/link"

function formatCpfInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 3) return d
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`
}

function formatPhoneInput(value: string): string {
  const d = value.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return `(${d}`
  if (d.length <= 7) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: "",
    cpf: "",
    phone_whatsapp: "",
    total_sessions: "10",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = "Nome é obrigatório"
    if (form.cpf.replace(/\D/g, "").length !== 11) errs.cpf = "CPF inválido"
    if (form.phone_whatsapp.replace(/\D/g, "").length < 10) errs.phone_whatsapp = "Telefone inválido"
    if (!form.total_sessions || Number(form.total_sessions) < 1) errs.total_sessions = "Mínimo 1 sessão"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          total_sessions: Number(form.total_sessions),
        }),
      })

      if (res.ok) {
        toast.success("Cliente cadastrado com sucesso!")
        router.push("/admin/clients")
      } else {
        const data = await res.json()
        toast.error(data.error || "Erro ao cadastrar cliente")
      }
    } catch {
      toast.error("Erro de conexão")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <AdminHeader title="Novo Cliente" />
      <div className="flex flex-col gap-6 p-4 md:p-6">
        <Button asChild variant="ghost" size="sm" className="w-fit text-muted-foreground">
          <Link href="/admin/clients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Clientes
          </Link>
        </Button>

        <Card className="mx-auto w-full max-w-lg border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <UserPlus className="h-5 w-5 text-primary" />
              Cadastrar Novo Cliente
            </CardTitle>
            <CardDescription>Preencha os dados para registrar um novo cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="name" className="text-card-foreground">Nome Completo</Label>
                <Input
                  id="name"
                  placeholder="Maria Silva"
                  value={form.name}
                  onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                  className="bg-muted text-foreground"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="cpf" className="text-card-foreground">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={(e) => setForm(f => ({ ...f, cpf: formatCpfInput(e.target.value) }))}
                  className="bg-muted font-mono text-foreground"
                />
                {errors.cpf && <p className="text-sm text-destructive">{errors.cpf}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="phone" className="text-card-foreground">WhatsApp</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-0000"
                  value={form.phone_whatsapp}
                  onChange={(e) => setForm(f => ({ ...f, phone_whatsapp: formatPhoneInput(e.target.value) }))}
                  className="bg-muted text-foreground"
                />
                {errors.phone_whatsapp && <p className="text-sm text-destructive">{errors.phone_whatsapp}</p>}
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="sessions" className="text-card-foreground">Pacote Inicial (sessões)</Label>
                <Input
                  id="sessions"
                  type="number"
                  min="1"
                  max="50"
                  value={form.total_sessions}
                  onChange={(e) => setForm(f => ({ ...f, total_sessions: e.target.value }))}
                  className="bg-muted text-foreground"
                />
                {errors.total_sessions && <p className="text-sm text-destructive">{errors.total_sessions}</p>}
              </div>

              <Button type="submit" size="lg" className="mt-2" disabled={loading}>
                {loading ? "Salvando..." : "Cadastrar Cliente"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
