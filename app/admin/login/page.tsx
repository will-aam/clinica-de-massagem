"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (data.success) {
        router.push("/admin/dashboard")
      } else {
        setError(data.error || "Erro ao fazer login")
      }
    } catch {
      setError("Erro de conexão. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-3xl text-card-foreground">Serenita</CardTitle>
          <CardDescription>Acesse o painel administrativo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@serenita.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted text-foreground"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-card-foreground">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted text-foreground"
              />
            </div>

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <Button type="submit" size="lg" className="mt-2" disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              {"Use admin@serenita.com / 123456"}
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
