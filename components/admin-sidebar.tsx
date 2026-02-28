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
  Award,
  Link2,
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
import { cn } from "@/lib/utils";

// Itens fixos do menu principal
const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clientes", href: "/admin/clients", icon: Users },
  { title: "Serviços", href: "/admin/services", icon: UserCog },
  { title: "Histórico Check-in", href: "/admin/history", icon: ClipboardList },
  { title: "Vouchers", href: "/admin/vouchers", icon: Award },
  { title: "Link na Bio", href: "/admin/link-bio", icon: Link2 },
];

// Sub-itens da Agenda (Novo Agendamento removido pois já está na página)
const agendaSubItems = [
  { title: "Calendário", href: "/admin/agenda", active: true },
  { title: "Agendamentos Recorrentes", href: "#", active: false },
  { title: "Bloqueio de Horário", href: "#", active: false },
  { title: "Lista de Espera", href: "#", active: false },
  { title: "Confirmações e Lembretes", href: "#", active: false },
  { title: "Fichas de Anamnese", href: "#", active: false },
];

const financeSubItems = [
  { title: "Dashboard Financeiro", active: false },
  { title: "Títulos a Receber", active: false },
  { title: "Meios de Pagamento", active: false },
  { title: "Gestão de Comissões", active: false },
  { title: "Pacotes e Planos", active: false },
  { title: "Despesas", active: false },
  { title: "Relatórios", active: false },
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
          <h2 className="font-inter text-xl font-bold text-sidebar-foreground tracking-tight">
            Totten
          </h2>
        </Link>
      </SidebarHeader>

      <SidebarContent className="overflow-y-auto [&::-webkit-scrollbar]:hidden">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
            Menu Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    className="hover:bg-muted/50"
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

        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
            Módulos Extras
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Agenda */}
              <Collapsible
                asChild
                defaultOpen={pathname.startsWith("/admin/agenda")}
                className="group/collapsible w-full"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <CalendarDays className="h-4 w-4" />
                          <span>Agenda</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-border ml-4 mt-1">
                      {agendaSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild={subItem.active}
                            className={cn(
                              "py-2",
                              !subItem.active &&
                                "opacity-50 cursor-not-allowed",
                            )}
                          >
                            {subItem.active ? (
                              <Link
                                href={subItem.href}
                                onClick={() => setOpenMobile(false)}
                              >
                                <span className="text-xs">{subItem.title}</span>
                              </Link>
                            ) : (
                              <div className="flex items-center justify-between w-full">
                                <span className="text-xs">{subItem.title}</span>
                                <Lock className="h-2.5 w-2.5 opacity-50" />
                              </div>
                            )}
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Financeiro */}
              <Collapsible asChild className="group/collapsible w-full">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton className="hover:bg-muted/50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4" />
                          <span>Financeiro</span>
                        </div>
                        <ChevronRight className="h-3 w-3 text-muted-foreground/50 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </div>
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-l border-border ml-4 mt-1">
                      {financeSubItems.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton className="opacity-50 cursor-not-allowed py-2">
                            <div className="flex items-center justify-between w-full">
                              <span className="text-xs">{subItem.title}</span>
                              <Lock className="h-2.5 w-2.5 opacity-50" />
                            </div>
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
              <span className="text-sm font-medium leading-none mb-1">
                Administrador
              </span>
              <span className="text-[10px] text-muted-foreground leading-none">
                admin@totten.com
              </span>
            </div>
          </div>
          <button className="relative p-2 text-muted-foreground hover:bg-muted rounded-full transition-all">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
          </button>
        </div>
        <div className="h-px bg-border/50 w-full" />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="hover:text-primary">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <Headset className="h-4 w-4" />
                <span>Suporte</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/admin/settings")}
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
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
