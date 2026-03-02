"use client";

import { useState } from "react";
import { signIn } from "next-auth/react"; // 🔥 MUDANÇA 1
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // 🔥 MUDANÇA 2: Troca o fetch() pelo signIn() do NextAuth
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Não redireciona automaticamente
      });

      if (result?.error) {
        // 🔥 MUDANÇA 3: Trata erro do NextAuth
        setError("E-mail ou senha inválidos");
      } else if (result?.ok) {
        // 🔥 MUDANÇA 4: Sucesso! Redireciona
        router.push("/admin/dashboard");
        router.refresh(); // Força reload da sessão
      }
    } catch {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-svh items-center justify-center bg-background p-4">
      {/* Botão de Voltar para o Totem */}
      <Link
        href="/totem/idle"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors group"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-card shadow-sm border border-border group-hover:bg-[#D9C6BF]/20 transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </div>
        <span className="hidden sm:inline font-medium">
          Voltar para a Recepção
        </span>
      </Link>

      <Card className="w-full max-w-md border-border shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-sm">
            <Heart className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="font-serif text-3xl text-card-foreground">
            Totten
          </CardTitle>
          <CardDescription>Acesse o painel administrativo</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="email" className="text-card-foreground">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-muted text-foreground focus-visible:ring-primary"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="password" className="text-card-foreground">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Sua senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-muted text-foreground focus-visible:ring-primary"
              />
            </div>

            {error && (
              <p className="text-sm font-medium text-destructive bg-destructive/10 p-2 rounded-md text-center">
                {error}
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="mt-2 text-base shadow-sm hover:scale-[1.02] transition-transform"
              disabled={loading}
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>

            {/* Link para a página de Registro */}
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Ainda não tem uma conta?{" "}
              <Link
                href="/admin/register"
                className="font-medium text-primary hover:underline"
              >
                Crie uma conta
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
