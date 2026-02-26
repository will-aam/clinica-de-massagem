// components/client/client-package.tsx
"use client";

import { useState } from "react";
import { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Package, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Package as PackageType } from "@/lib/data";

interface ClientPackageProps {
  clientId: string;
  clientName: string;
  activePackage: PackageType | null;
}

export function ClientPackage({
  clientId,
  clientName,
  activePackage,
}: ClientPackageProps) {
  const [newSessions, setNewSessions] = useState("10");
  const [addPkgOpen, setAddPkgOpen] = useState(false);

  const progress = activePackage
    ? Math.round(
        (activePackage.used_sessions / activePackage.total_sessions) * 100,
      )
    : 0;

  const handleAddPackage = async () => {
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ total_sessions: Number(newSessions) }),
      });
      if (res.ok) {
        toast.success("Novo pacote adicionado!");
        setAddPkgOpen(false);
        mutate(`/api/clients/${clientId}`); // Atualiza apenas os dados deste cliente!
      } else {
        toast.error("Erro ao adicionar pacote");
      }
    } catch {
      toast.error("Erro de conexão");
    }
  };

  return (
    <Card className="md:col-span-1 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-3 md:pb-6 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Package className="h-5 w-5 text-primary" /> Pacote Atual
        </CardTitle>
        <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
          <DialogTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="rounded-full text-primary bg-primary/10 hover:bg-primary/20 h-8 w-8"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md rounded-xl">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Pacote</DialogTitle>
              <DialogDescription>
                Inicie um novo ciclo de sessões para {clientName.split(" ")[0]}.
              </DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-2 py-4">
              <Label htmlFor="newSessions">Total de Sessões Compradas</Label>
              <Input
                id="newSessions"
                type="number"
                min="1"
                max="50"
                value={newSessions}
                onChange={(e) => setNewSessions(e.target.value)}
                className="bg-muted text-lg h-12 font-bold text-center"
              />
            </div>
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setAddPkgOpen(false)}
                className="w-full sm:w-auto rounded-full"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleAddPackage}
                className="w-full sm:w-auto rounded-full"
              >
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
        {activePackage ? (
          <div className="flex flex-col gap-4 bg-primary/5 p-4 md:p-5 rounded-xl border border-primary/10 relative overflow-hidden">
            <div className="relative z-10">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Progresso
                </span>
                <span className="text-2xl font-bold text-foreground leading-none">
                  {activePackage.used_sessions}{" "}
                  <span className="text-base text-muted-foreground font-normal">
                    / {activePackage.total_sessions}
                  </span>
                </span>
              </div>
              <Progress
                value={progress}
                className="h-2.5 bg-primary/20 [&>div]:bg-primary rounded-full"
              />
              <p className="mt-3 text-[13px] font-medium text-muted-foreground">
                {activePackage.total_sessions - activePackage.used_sessions > 0
                  ? `Restam ${activePackage.total_sessions - activePackage.used_sessions} sessões para finalizar.`
                  : "Pacote 100% concluído! 🎉"}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
            <Package className="h-10 w-10 text-muted-foreground/40" />
            <p className="mt-3 text-sm text-muted-foreground px-4">
              Nenhum pacote ativo.
            </p>
            <Button
              variant="link"
              onClick={() => setAddPkgOpen(true)}
              className="text-primary mt-1"
            >
              Adicionar agora
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
