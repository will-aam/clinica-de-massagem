"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bird,
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  CalendarDays,
  Wallet,
  Lock,
  Headset,
  Bell,
  User,
  ChevronRight,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clientes", href: "/admin/clients", icon: Users },
  { title: "Serviços", href: "/admin/services", icon: UserCog },
  { title: "Histórico", href: "/admin/history", icon: ClipboardList },
];

// Sub-itens da Agenda baseados no seu mapeamento
const agendaSubItems = [
  "Calendário",
  "Novo Agendamento",
  "Agendamentos Recorrentes",
  "Bloqueio de Horário",
  "Lista de Espera",
  "Confirmações e Lembretes",
  "Fichas de Anamnese",
];

const financeSubItems = [
  "Dashboard Financeiro",
  "Títulos a Receber",
  "Meios de Pagamento",
  "Gestão de Comissões",
  "Pacotes e Planos",
  "Despesas",
  "Análises (Analytics)",
  "Relatórios",
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const supportPhone = "5579998752198";
  const supportMessage = encodeURIComponent(
    "Olá! Preciso de ajuda com o sistema Totten.",
  );
  const whatsappUrl = `https://wa.me/${supportPhone}?text=${supportMessage}`;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link
          href="/admin/dashboard"
          className="flex items-center gap-3"
          onClick={() => setOpenMobile(false)}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Bird className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-inter text-xl font-bold text-sidebar-foreground tracking-tight">
              Totten
            </h2>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {" "}
        {/* Menu Principal */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <Link href={item.href} onClick={() => setOpenMobile(false)}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {/* Módulos Adicionais (Agenda e Financeiro com Dropdown) */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Módulos Extras
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Agenda - Com Leque de Opções */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>Agenda</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold bg-muted border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1 group-data-[state=open]/collapsible:hidden">
                            <Lock className="h-2 w-2" />
                            Em breve
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-border ml-4 mt-1">
                      {agendaSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem}>
                          <SidebarMenuSubButton className="opacity-50 cursor-not-allowed py-2">
                            <span className="text-xs">{subItem}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Financeiro - Com Leque de Opções */}
              <Collapsible className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>Financeiro</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] uppercase font-bold bg-muted border border-border/50 px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1 group-data-[state=open]/collapsible:hidden">
                            <Lock className="h-2 w-2" />
                            Em breve
                          </span>
                          <ChevronRight className="h-3 w-3 text-muted-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-border ml-4 mt-1">
                      {financeSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem}>
                          <SidebarMenuSubButton className="opacity-50 cursor-not-allowed py-2">
                            <span className="text-xs">{subItem}</span>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-sidebar-foreground leading-none mb-1">
                Administrador
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                admin@totten.com
              </span>
            </div>
          </div>
          <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full transition-all active:scale-95">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>

        <div className="h-px bg-border/50 w-full" />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpenMobile(false)}
              >
                <Headset className="h-4 w-4" />
                <span>Suporte</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/admin/settings")}
              className="hover:bg-muted/50 transition-colors"
            >
              <Link href="/admin/settings" onClick={() => setOpenMobile(false)}>
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton
              asChild
              className="text-destructive hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Link href="/admin/login">
                <LogOut className="h-4 w-4" />
                <span>Sair</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
