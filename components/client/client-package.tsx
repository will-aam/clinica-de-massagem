"use client";

import { useEffect, useState } from "react";
import { mutate } from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Package, Plus, Award } from "lucide-react";
import { toast } from "sonner";
import type { Package as PackageType } from "@/lib/data";
import { PackageVoucher } from "./package-voucher";

interface PackageTemplate {
  id: string;
  name: string;
  total_sessions: number;
  price: number;
  validity_days: number | null;
  is_active: boolean;
}

interface ServiceOption {
  id: string;
  name: string;
}

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
  const [addPkgOpen, setAddPkgOpen] = useState(false);
  const [voucherOpen, setVoucherOpen] = useState(false);

  const [templates, setTemplates] = useState<PackageTemplate[]>([]);
  const [services, setServices] = useState<ServiceOption[]>([]);
  const [templateId, setTemplateId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [tplRes, svcRes] = await Promise.all([
          fetch("/api/package-templates"),
          fetch("/api/admin/services"),
        ]);

        if (tplRes.ok) {
          const tplData = await tplRes.json();
          const active = tplData.filter((t: PackageTemplate) => t.is_active);
          setTemplates(active);
          if (active.length) setTemplateId(active[0].id);
        }

        if (svcRes.ok) {
          const svcData = await svcRes.json();
          const svc = (svcData.services ?? []).map((s: any) => ({
            id: s.id,
            name: s.name,
          }));
          setServices(svc);
          if (svc.length) setServiceId(svc[0].id);
        }
      } catch (e) {
        console.error("Erro ao carregar dados:", e);
      }
    };

    loadData();
  }, []);

  const progress = activePackage
    ? Math.round(
        (activePackage.used_sessions / activePackage.total_sessions) * 100,
      )
    : 0;

  const isCompleted = activePackage
    ? activePackage.used_sessions >= activePackage.total_sessions
    : false;

  const handleAddPackage = async () => {
    if (!templateId) {
      toast.error("Selecione um pacote");
      return;
    }
    if (!serviceId) {
      toast.error("Selecione um serviço");
      return;
    }

    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template_id: templateId,
          service_id: serviceId,
        }),
      });

      if (res.ok) {
        toast.success("Pacote adicionado com sucesso!");
        mutate(`/api/clients/${clientId}`);
        setAddPkgOpen(false);
      } else {
        const data = await res.json();
        toast.error(data.error || "Erro ao adicionar pacote");
      }
    } catch (error) {
      console.error(error);
      toast.error("Erro de conexão");
    }
  };

  return (
    <>
      <Card className="md:col-span-1 border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
        <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4 flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2 text-foreground">
            <Package className="h-5 w-5 text-primary" />
            Pacote
          </CardTitle>

          <Dialog open={addPkgOpen} onOpenChange={setAddPkgOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full">
                <Plus className="h-4 w-4 mr-1" /> Novo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Adicionar pacote ao cliente</DialogTitle>
                <DialogDescription>
                  Selecione um pacote já cadastrado.
                </DialogDescription>
              </DialogHeader>

              <div className="flex flex-col gap-2">
                <Label>Pacote</Label>
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                >
                  {templates.map((tpl) => (
                    <option key={tpl.id} value={tpl.id}>
                      {tpl.name} ({tpl.total_sessions} sessões)
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <Label>Serviço</Label>
                <select
                  className="h-10 rounded-md border border-border bg-background px-3 text-sm"
                  value={serviceId}
                  onChange={(e) => setServiceId(e.target.value)}
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.id}>
                      {svc.name}
                    </option>
                  ))}
                </select>
              </div>

              <DialogFooter>
                <Button onClick={handleAddPackage}>Adicionar</Button>
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

                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-[13px] font-medium text-muted-foreground">
                    {!isCompleted
                      ? `Restam ${
                          activePackage.total_sessions -
                          activePackage.used_sessions
                        } sessões para finalizar.`
                      : "Pacote 100% concluído! 🎉"}
                  </p>

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
            <div className="flex flex-col items-center justify-center py-8 text-center bg-muted/30 rounded-xl border border-dashed border-border">
              <p className="text-sm text-muted-foreground">
                Este cliente ainda não possui pacote ativo.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {activePackage && (
        <PackageVoucher
          open={voucherOpen}
          onOpenChange={setVoucherOpen}
          clientName={clientName}
          packageName={activePackage.name}
          totalSessions={activePackage.total_sessions}
          packageId={activePackage.id}
        />
      )}
    </>
  );
}
