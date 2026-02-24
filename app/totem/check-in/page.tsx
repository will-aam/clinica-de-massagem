"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CpfKeypad, formatCpf } from "@/components/cpf-keypad";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function TotemCheckInPage() {
  const router = useRouter();
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    const digits = cpf.replace(/\D/g, "");
    if (digits.length !== 11) return;

    setLoading(true);
    try {
      const formatted = formatCpf(digits);
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: formatted }),
      });

      const data = await res.json();

      if (data.success) {
        const params = new URLSearchParams({
          name: data.client.name,
          used: String(data.package_info.used_sessions),
          total: String(data.package_info.total_sessions),
        });
        router.push(`/totem/success?${params.toString()}`);
      } else {
        const errorType = data.error || "UNKNOWN";
        router.push(`/totem/error?type=${errorType}`);
      }
    } catch {
      router.push("/totem/error?type=UNKNOWN");
    } finally {
      setLoading(false);
    }
  };

  return (
    // Container principal: ocupa a tela toda e centraliza o conteúdo
    <div className="flex min-h-dvh w-full items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="relative flex w-full max-w-lg flex-col items-center gap-8 rounded-3xl bg-card p-6 shadow-xl border border-border sm:p-10 md:p-12">
        {/* Botão Voltar - Posicionado de forma absoluta dentro do card */}
        <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
          <Link
            href="/totem/idle"
            className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground group"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted group-hover:bg-[#D9C6BF]/30 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </div>
            <span className="hidden font-medium sm:inline">Voltar</span>
          </Link>
        </div>

        {/* Textos de Cabeçalho */}
        <div className="mt-12 text-center sm:mt-4">
          <h1 className="font-serif text-3xl font-bold text-foreground md:text-5xl">
            Check-in
          </h1>
          <p className="mt-3 text-sm text-muted-foreground md:text-base leading-relaxed">
            Digite seu CPF para registrar sua presença
          </p>
        </div>

        {/* O teclado numérico em si */}
        <div className="w-full max-w-sm">
          <CpfKeypad
            value={cpf}
            onChange={setCpf}
            onConfirm={handleConfirm}
            disabled={loading}
          />
        </div>

        {loading && (
          <p className="text-sm font-medium text-primary animate-pulse">
            Verificando pacote...
          </p>
        )}
      </div>
    </div>
  );
}
