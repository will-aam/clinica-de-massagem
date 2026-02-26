"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bird, // Ícone novo para o logo
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  LogOut,
  CalendarDays, // Ícone para a Agenda
  Wallet, // Ícone para o Financeiro
  Lock, // Ícone de cadeado para os módulos inativos
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

  return (
    <Sidebar>
      <SidebarHeader className="p-4 border-b">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
            <Bird className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-inter text-xl font-bold text-sidebar-foreground">
              Totten
            </h2>
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
          <SidebarMenuItem>
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
          <SidebarMenuItem className="mt-2">
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
