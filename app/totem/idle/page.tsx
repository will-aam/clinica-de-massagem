"use client";

import Link from "next/link";
import { Heart, Lock } from "lucide-react";

export default function TotemIdlePage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center gap-10 p-8 text-center">
      {/* Logo / Clinic Name */}
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary">
          <Heart className="h-12 w-12 text-primary-foreground" />
        </div>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-foreground md:text-6xl">
          Clínica
        </h1>
        <p className="max-w-sm text-lg text-muted-foreground leading-relaxed">
          Sua jornada de bem-estar começa aqui.
        </p>
      </div>

      {/* Check-in Button */}
      <Link
        href="/totem/check-in"
        className="flex h-20 w-72 items-center justify-center rounded-xl bg-primary text-xl font-semibold text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95 md:h-24 md:w-80 md:text-2xl"
      >
        Fazer Check-in
      </Link>

      {/* Decorative subtle text */}
      <p className="text-sm text-muted-foreground">
        Toque no botão para registrar sua presença
      </p>

      {/* Secret Admin Login Link */}
      <div className="absolute bottom-4 right-4">
        <Link
          href="/admin/login"
          className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
        >
          <Lock className="h-5 w-5" />
          <span className="sr-only">Acesso Administrativo</span>
        </Link>
      </div>
    </div>
  );
}
