"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MonitorSmartphone,
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  CalendarDays,
  Wallet,
  Lock,
  Headset, // Importamos o ícone de suporte
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
} from "@/components/ui/sidebar";

const navItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Clientes", href: "/admin/clients", icon: Users },
  { title: "Histórico", href: "/admin/history", icon: ClipboardList },
];

const moduleItems = [
  { title: "Agenda", href: "#", icon: CalendarDays, comingSoon: true },
  { title: "Financeiro", href: "#", icon: Wallet, comingSoon: true },
];

export function AdminSidebar() {
  const pathname = usePathname();

  // Número e mensagem formatados para o botão de suporte
  const supportPhone = "5579998752198";
  const supportMessage = encodeURIComponent(
    "Olá! Preciso de ajuda com o sistema Totten.",
  );
  const whatsappUrl = `https://wa.me/${supportPhone}?text=${supportMessage}`;

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <MonitorSmartphone className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-inter text-xl font-bold text-sidebar-foreground">
              Totten
            </h2>
            <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
              Sistema de Gestão
            </p>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent>
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
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Módulos Adicionais (Em Breve) */}
        <SidebarGroup className="mt-4">
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
            Módulos Extras
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {moduleItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="opacity-60 cursor-not-allowed hover:bg-transparent"
                    asChild
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </div>
                      <span className="text-[9px] uppercase font-bold bg-muted px-1.5 py-0.5 rounded text-muted-foreground flex items-center gap-1">
                        <Lock className="h-2 w-2" />
                        Em breve
                      </span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 border-t">
        <SidebarMenu>
          {/* Botão de Suporte (Abre em nova aba) */}
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="hover:bg-primary/10 hover:text-primary transition-colors"
            >
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
              className="hover:bg-muted/50 transition-colors"
            >
              <Link href="/admin/settings">
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
