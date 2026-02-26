"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { Client as ClientType } from "@/lib/data";

export function ClientHeader({ client }: { client: ClientType }) {
  const initial = client.name.charAt(0).toUpperCase();

  return (
    <div className="flex items-center gap-4 border-b border-border/50 pb-4 md:pb-6">
      <Button
        asChild
        variant="outline"
        size="icon"
        className="rounded-full h-10 w-10 shrink-0"
      >
        <Link href="/admin/clients">
          <ArrowLeft className="h-5 w-5 text-muted-foreground" />
        </Link>
      </Button>
      <div className="flex items-center gap-3 w-full">
        <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xl shadow-sm border border-primary/20">
          {initial}
        </div>
        <div className="flex flex-col flex-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground leading-none mb-1.5">
            {client.name}
          </h1>
          <span className="text-xs font-mono text-muted-foreground leading-none">
            CPF: {client.cpf}
          </span>
        </div>
      </div>
    </div>
  );
}
