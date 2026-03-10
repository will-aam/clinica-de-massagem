"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AdminHeader } from "@/components/admin-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  Users,
  AlertTriangle,
  CalendarClock,
  ArrowUp,
  History,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PackageDetailsModal } from "@/components/packages/package-details-modal";
// 🔥 Importamos a nossa nova Action
import { getPackagesDashboardData } from "@/app/actions/packages";
import { toast } from "sonner";

function KpiCard({
  title,
  value,
  description,
  icon: Icon,
  className,
  loading,
}: any) {
  return (
    <Card
      className={cn(
        "border-border shadow-sm flex flex-col justify-between",
        className,
      )}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground/20" />
        ) : (
          <div className="text-3xl font-bold text-foreground tracking-tight">
            {value}
          </div>
        )}
        <p className="mt-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}

function PackageListItem({ pkg, onOpenDetails }: any) {
  const isEndingSoon = pkg.usedSessions >= pkg.totalSessions - 2;

  return (
    <div className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors px-2 -mx-2 rounded-lg group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/5 text-primary font-bold border border-primary/10 transition-transform group-active:scale-95">
          {pkg.clientName.charAt(0)}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-foreground truncate">
            {pkg.clientName}
          </span>
          <span className="text-[11px] text-muted-foreground truncate uppercase font-medium">
            {pkg.packageName}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end w-17.5 sm:w-25">
        <span className="text-[13px] font-bold text-foreground leading-none">
          {pkg.usedSessions}{" "}
          <span className="text-muted-foreground font-normal text-[11px]">
            /
          </span>{" "}
          {pkg.totalSessions}
        </span>
        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tighter mt-1">
          Sessões
        </span>
      </div>

      <div className="flex items-center justify-end w-21.25 sm:w-27.5 gap-2">
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-tighter text-right",
            isEndingSoon ? "text-orange-600" : "text-emerald-600",
          )}
        >
          {isEndingSoon ? "Finalizando" : "Ativo"}
        </span>
        <span
          className={cn(
            "flex h-2 w-2 rounded-full shrink-0",
            isEndingSoon ? "bg-orange-500 animate-pulse" : "bg-emerald-500",
          )}
        />
      </div>

      <div className="flex items-center gap-0.5 sm:gap-1 pl-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={() => onOpenDetails(pkg)}
        >
          <History className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function PackagesPage() {
  const router = useRouter();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);

  // 🔥 NOVOS ESTADOS REAIS
  const [packages, setPackages] = useState<any[]>([]);
  const [kpis, setKpis] = useState({
    active: 0,
    endingSoon: 0,
    totalPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. CARREGAR DADOS DO BANCO
  const loadData = async () => {
    setLoading(true);
    const result = await getPackagesDashboardData();
    if (result.success) {
      setPackages(result.packages || []);
      setKpis(result.kpis || { active: 0, endingSoon: 0, totalPending: 0 });
    } else {
      toast.error(result.error || "Erro ao carregar pacotes");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
    const handleScroll = () => setShowScrollTop(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 2. FILTRAR CLIENTES
  const filteredPackages = packages.filter((p) =>
    p.clientName.toLowerCase().includes(search.toLowerCase()),
  );

  const handleOpenDetails = (pkg: any) => {
    setSelectedPackage(pkg);
    setDetailsOpen(true);
  };

  return (
    <>
      <AdminHeader title="Pacotes" />

      <div className="flex flex-col gap-6 p-4 md:p-6 max-w-6xl mx-auto w-full pb-24 relative">
        {/* KPIs REAIS */}
        <div className="flex overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scroll-smooth md:grid md:grid-cols-3 md:overflow-visible md:pb-0 md:px-0 md:mx-0 gap-4 [&::-webkit-scrollbar]:hidden">
          <KpiCard
            title="Pacotes Ativos"
            value={kpis.active}
            description="Em andamento"
            icon={Users}
            loading={loading}
            className="min-w-[85vw] md:min-w-0 snap-center shrink-0"
          />
          <KpiCard
            title="Próximos do Fim"
            value={kpis.endingSoon}
            description="Saldo crítico"
            icon={AlertTriangle}
            loading={loading}
            className="min-w-[85vw] md:min-w-0 snap-center shrink-0"
          />
          <KpiCard
            title="Sessões Pendentes"
            value={kpis.totalPending}
            description="Carga de trabalho"
            icon={CalendarClock}
            loading={loading}
            className="min-w-[85vw] md:min-w-0 snap-center shrink-0"
          />
        </div>

        {/* BUSCA */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por cliente..."
              className="pl-9 h-11 bg-background rounded-xl border-none shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            onClick={() => router.push("/admin/clients")}
            className="h-11 px-4 font-bold rounded-xl shadow-md active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline">Nova Venda</span>
          </Button>
        </div>

        {/* LISTA DINÂMICA */}
        <Card className="border-none shadow-none bg-transparent md:bg-card md:border md:shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="px-0 pt-0 md:pt-6 md:px-6">
            <CardTitle className="flex items-center gap-2 text-lg font-bold">
              <CalendarClock className="h-5 w-5 text-primary" />
              Gestão de Consumo
            </CardTitle>
            <CardDescription>
              Acompanhe o saldo de sessões em tempo real
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 md:pb-6 md:px-6">
            {loading ? (
              <div className="flex flex-col items-center py-20 text-muted-foreground gap-3">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Sincronizando banco...
                </span>
              </div>
            ) : filteredPackages.length > 0 ? (
              <div className="flex flex-col">
                {filteredPackages.map((pkg) => (
                  <PackageListItem
                    key={pkg.id}
                    pkg={pkg}
                    onOpenDetails={handleOpenDetails}
                  />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center border-2 border-dashed border-muted rounded-3xl">
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  Nenhum pacote encontrado
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <PackageDetailsModal
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
        packageData={selectedPackage}
      />

      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className={cn(
          "fixed bottom-20 md:bottom-8 right-4 md:right-8 p-3 rounded-full bg-primary text-primary-foreground shadow-lg active:scale-90 transition-all duration-300 z-50",
          showScrollTop
            ? "translate-y-0 opacity-100"
            : "translate-y-10 opacity-0 pointer-events-none",
        )}
      >
        <ArrowUp className="h-5 w-5" strokeWidth={3} />
      </button>
    </>
  );
}
