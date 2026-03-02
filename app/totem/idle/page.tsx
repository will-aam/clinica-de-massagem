// Esse arquivo já deve existir, mas verifique se NÃO tem nenhuma validação de sessão
// Deixe-o como está (sem getServerSession ou getCurrentAdmin)

"use client";

import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TotemIdlePage() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-8 text-center">
        {/* Logo */}
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary shadow-lg">
          <Heart className="h-12 w-12 text-primary-foreground" />
        </div>

        {/* Título */}
        <div>
          <h1 className="font-serif text-5xl font-bold text-foreground md:text-7xl">
            Totten
          </h1>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            Sistema de Check-in
          </p>
        </div>

        {/* Botão de Check-in */}
        <Button asChild size="lg" className="text-lg px-8 py-6 shadow-lg">
          <Link href="/totem/check-in">Fazer Check-in</Link>
        </Button>

        {/* Link para Admin */}
        <Link
          href="/admin/login"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Acesso Administrativo
        </Link>
      </div>
    </div>
  );
}
