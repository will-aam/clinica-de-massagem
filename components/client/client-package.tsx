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
import { Package, Plus, Award } from "lucide-react"; // Adicionado o Award (Medalha)
import { toast } from "sonner";
import type { Package as PackageType } from "@/lib/data";

// Importando o novo componente do Voucher
import { PackageVoucher } from "./package-voucher";

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

  // Estado para controlar a abertura do modal do comprovante
  const [voucherOpen, setVoucherOpen] = useState(false);

  const progress = activePackage
    ? Math.round(
        (activePackage.used_sessions / activePackage.total_sessions) * 100,
      )
    : 0;

  // Verifica se terminou todas as sessões
  const isCompleted = activePackage
    ? activePackage.used_sessions >= activePackage.total_sessions
    : false;

  const handleAddPackage = async () => {
    // ... (sua lógica original de adicionar pacote fica igual)
  };

  return (
    <>
      <Card className="md:col-span-1 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        {/* ... (Header do card continua igual) ... */}

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

                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    {!isCompleted
                      ? `Restam ${activePackage.total_sessions - activePackage.used_sessions} sessões para finalizar.`
                      : "Pacote 100% concluído! 🎉"}
                  </p>

                  {/* BOTÃO MÁGICO DO COMPROVANTE */}
                  {isCompleted && (
                    <Button
                      onClick={() => setVoucherOpen(true)}
                      className="w-full rounded-full shadow-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Gerar Comprovante
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            // ... (estado sem pacote continua igual) ...
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
              {/* ... */}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renderiza o Modal do Comprovante (escondido até clicar no botão) */}
      {activePackage && (
        <PackageVoucher
          open={voucherOpen}
          onOpenChange={setVoucherOpen}
          clientName={clientName}
          packageName="Pacote de Massagem" // No futuro, puxar o nome real do pacote do BD
          totalSessions={activePackage.total_sessions}
        />
      )}
    </>
  );
}
