"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense } from "react";
import { AlertTriangle, ArrowLeft, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

const errorMessages: Record<string, { title: string; description: string }> = {
  CPF_NOT_FOUND: {
    title: "CPF não encontrado",
    description:
      "Não encontramos seu cadastro. Por favor, fale com a recepção para se cadastrar.",
  },
  PACKAGE_EXHAUSTED: {
    title: "Pacote de sessões esgotado",
    description:
      "Todas as sessões do seu pacote foram utilizadas. Fale com a recepção para renovar.",
  },
  NO_ACTIVE_PACKAGE: {
    title: "Nenhum pacote ativo",
    description:
      "Você não possui um pacote de sessões ativo. Fale com a recepção.",
  },
  UNKNOWN: {
    title: "Erro inesperado",
    description:
      "Ocorreu um problema ao processar seu check-in. Tente novamente ou fale com a recepção.",
  },
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorType = searchParams.get("type") || "UNKNOWN";
  const error = errorMessages[errorType] || errorMessages.UNKNOWN;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 p-6 text-center">
      {/* Error Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="h-14 w-14 text-destructive" />
      </div>

      {/* Error Message */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          {error.title}
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          {error.description}
        </p>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <Button asChild size="lg" className="h-16 text-lg">
          <Link href="/totem/check-in">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Tentar Novamente
          </Link>
        </Button>

        <Button
          asChild
          variant="outline"
          size="lg"
          className="h-16 text-lg text-foreground"
        >
          <Link href="/totem/idle">
            <Phone className="mr-2 h-5 w-5" />
            Falar com a Recepção
          </Link>
        </Button>
      </div>
    </div>
  );
}

export default function TotemErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center p-6">
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
