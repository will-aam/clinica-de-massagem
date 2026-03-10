"use client";

import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  CheckCircle2,
  Clock,
  History,
  Plus,
  RotateCcw,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getPackageHistory } from "@/app/actions/packages"; // 🔥 Importamos a nova ação
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PackageDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  packageData: any | null;
}

export function PackageDetailsModal({
  open,
  onOpenChange,
  packageData,
}: PackageDetailsModalProps) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔥 CARREGA O HISTÓRICO REAL AO ABRIR
  useEffect(() => {
    async function loadHistory() {
      if (!open || !packageData?.id) return;
      setLoading(true);
      const result = await getPackageHistory(packageData.id);
      if (result.success) {
        setHistory(result.history || []);
      }
      setLoading(false);
    }
    loadHistory();
  }, [open, packageData?.id]);

  if (!packageData) return null;

  const progress = Math.round(
    (packageData.usedSessions / packageData.totalSessions) * 100,
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 gap-0 border-l border-border shadow-none bg-background">
        <SheetHeader className="p-6 pb-8 border-b border-border/50">
          <div className="flex items-center gap-2 text-primary mb-3">
            <History className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Extrato Detalhado
            </span>
          </div>
          <SheetTitle className="text-2xl font-black text-foreground">
            {packageData.clientName}
          </SheetTitle>
          <SheetDescription className="text-sm font-bold text-muted-foreground uppercase tracking-tight">
            {packageData.packageName}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
          {/* CONSUMO REAL */}
          <div className="bg-muted/30 border border-border p-5 rounded-3xl">
            <div className="flex justify-between items-end mb-4 px-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Uso do Pacote
              </span>
              <span className="text-2xl font-black text-foreground">
                {packageData.usedSessions}{" "}
                <span className="text-sm text-muted-foreground font-normal">
                  / {packageData.totalSessions}
                </span>
              </span>
            </div>
            <Progress value={progress} className="h-2 bg-muted rounded-full" />
          </div>

          {/* TIMELINE REAL */}
          <div className="space-y-8">
            <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-2 text-muted-foreground ml-1">
              <Calendar className="h-4 w-4" /> Cronograma de Sessões
            </h3>

            {loading ? (
              <div className="flex flex-col items-center py-10 gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Buscando histórico...
                </span>
              </div>
            ) : history.length > 0 ? (
              <div className="relative space-y-10 before:absolute before:inset-0 before:left-4.75 before:h-[95%] before:w-0.5 before:bg-border">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="relative flex items-start group"
                  >
                    <div
                      className={cn(
                        "absolute left-0 w-10 h-10 rounded-2xl border-2 border-background flex items-center justify-center z-10 transition-all",
                        item.status === "REALIZADO"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {item.status === "REALIZADO" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <span className="text-[11px] font-black">
                          {item.session || index + 1}
                        </span>
                      )}
                    </div>

                    <div className="ml-14 flex flex-col gap-1 w-full pr-2">
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm uppercase tracking-tight text-foreground">
                          Sessão {item.session || index + 1}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[9px] font-black uppercase px-2 py-0.5 rounded-md border",
                            item.status === "REALIZADO"
                              ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                              : "text-muted-foreground",
                          )}
                        >
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-medium">
                        {item.date
                          ? format(
                              new Date(item.date),
                              "dd/MM/yyyy 'às' HH:mm",
                              { locale: ptBR },
                            )
                          : "Data não definida"}
                      </p>
                      {item.obs && (
                        <div className="mt-3 p-3 bg-muted/50 rounded-xl text-[11px] font-medium text-muted-foreground border-l-2 border-primary/30">
                          "{item.obs}"
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border-2 border-dashed border-muted rounded-3xl">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Nenhuma sessão registrada
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-background border-t space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="rounded-2xl h-12 font-bold border-2"
            >
              <RotateCcw className="mr-2 h-4 w-4" /> Renovar
            </Button>
            <Button className="rounded-2xl h-12 font-bold">
              <Plus className="mr-2 h-4 w-4" /> Agendar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
