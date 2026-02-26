"use client";

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MobileNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface MobileBottomNavProps {
  items: MobileNavItem[];
  activeId: string;
  onChange: (id: string) => void;
}

export function MobileBottomNav({
  items,
  activeId,
  onChange,
}: MobileBottomNavProps) {
  return (
    // Escondido em telas médias para cima (md:hidden) e fixo na base (bottom-0)
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border pb-safe shadow-[0_-4px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_10px_rgba(0,0,0,0.2)]">
      <div className="flex justify-around items-center h-16 px-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200",
                isActive
                  ? "text-primary scale-105" // Destaque para o ativo
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {/* Se o ícone estiver ativo, damos um fundo suave e preenchemos */}
              <div
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isActive ? "bg-primary/10" : "bg-transparent",
                )}
              >
                <Icon
                  className={cn("h-5 w-5", isActive && "fill-primary/20")}
                />
              </div>
              <span
                className={cn(
                  "text-[10px] tracking-wide",
                  isActive ? "font-bold" : "font-medium",
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
