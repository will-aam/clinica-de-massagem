"use client";

import { useSidebar } from "@/components/ui/sidebar";
import { AlignLeft } from "lucide-react";

export function AdminHeader({ title }: { title: string }) {
  const { toggleSidebar } = useSidebar();

  return (
    // Altura reduzida (h-14 em vez de h-16), sem borda inferior, fundo transparente com blur
    <header className="sticky top-0 z-30 flex h-14 w-full items-center bg-background/60 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-3">
        {/* Botão sutil */}
        <button
          onClick={toggleSidebar}
          className="p-1.5 -ml-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-all active:scale-95"
        >
          <AlignLeft className="h-5 w-5" strokeWidth={2} />
          <span className="sr-only">Menu</span>
        </button>

        {/* Título discreto, estilo "Breadcrumb" (migalha de pão) */}
        <h1 className="text-sm font-medium text-muted-foreground">{title}</h1>
      </div>
    </header>
  );
}
