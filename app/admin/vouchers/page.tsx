"use client";

import { useState } from "react";
import { AdminHeader } from "@/components/admin-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PackageVoucher } from "@/components/client/package-voucher";
import { Search, Award, CheckCircle2 } from "lucide-react";

// DADOS MOCKADOS apenas para a página de Vouchers
const mockCompletedPackages = [
  {
    id: "1",
    clientName: "Juliana Albuquerque",
    packageName: "Projeto Verão (Drenagem + Modeladora)",
    totalSessions: 10,
    completionDate: "27 Fev 2026",
  },
  {
    id: "2",
    clientName: "Mariana Costa",
    packageName: "Massagem Relaxante Mensal",
    totalSessions: 4,
    completionDate: "25 Fev 2026",
  },
  {
    id: "3",
    clientName: "Amanda Silva",
    packageName: "Pacote Limpeza de Pele Profunda",
    totalSessions: 3,
    completionDate: "20 Fev 2026",
  },
  {
    id: "4",
    clientName: "Carla Mendes",
    packageName: "Projeto Verão (Drenagem + Modeladora)",
    totalSessions: 10,
    completionDate: "15 Fev 2026",
  },
];

export default function VouchersPage() {
  const [search, setSearch] = useState("");

  // Controle do Modal do Comprovante
  const [voucherOpen, setVoucherOpen] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState(
    mockCompletedPackages[0],
  );

  // Filtro de busca na demonstração
  const filteredVouchers = mockCompletedPackages.filter(
    (item) =>
      item.clientName.toLowerCase().includes(search.toLowerCase()) ||
      item.packageName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenVoucher = (
    voucherData: (typeof mockCompletedPackages)[0],
  ) => {
    setSelectedVoucher(voucherData);
    setVoucherOpen(true);
  };

  return (
    <>
      <AdminHeader title="Central de Comprovantes" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-5xl mx-auto w-full pb-24 md:pb-6">
        {/* Cabeçalho da Página */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border/50 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Vouchers Emitidos
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Gere e compartilhe os comprovantes de pacotes concluídos pelos
              seus clientes.
            </p>
          </div>

          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar cliente ou pacote..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-muted/50 rounded-full h-10"
            />
          </div>
        </div>

        {/* Lista de Vouchers (Mockada) */}
        <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
          <CardHeader className="hidden md:flex px-6 pt-6 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Prontos para Envio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6 flex flex-col gap-3">
            {filteredVouchers.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                Nenhum voucher encontrado com esta busca.
              </div>
            ) : (
              filteredVouchers.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-5 bg-card md:bg-muted/30 rounded-xl border border-border/50 hover:border-primary/30 transition-colors gap-4"
                >
                  {/* Info do Cliente */}
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#D9C6BF]/20 text-[#4A3F35]">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-semibold text-foreground text-base leading-tight">
                        {item.clientName}
                      </span>
                      <span className="text-sm text-muted-foreground mt-0.5">
                        {item.packageName} • {item.totalSessions} Sessões
                      </span>
                    </div>
                  </div>

                  {/* Data e Botão de Ação */}
                  <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0 pt-3 sm:pt-0 border-t sm:border-0 border-border/50">
                    <span className="text-xs font-medium text-muted-foreground px-3 py-1 bg-muted rounded-full">
                      {item.completionDate}
                    </span>

                    <Button
                      onClick={() => handleOpenVoucher(item)}
                      className="rounded-full shadow-sm bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all shrink-0"
                    >
                      <Award className="mr-2 h-4 w-4" />
                      Gerar Voucher
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* MODAL DO COMPROVANTE */}
      <PackageVoucher
        open={voucherOpen}
        onOpenChange={setVoucherOpen}
        clientName={selectedVoucher.clientName}
        packageName={selectedVoucher.packageName}
        totalSessions={selectedVoucher.totalSessions}
      />
    </>
  );
}
