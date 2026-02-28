"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Palette, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const SYSTEM_THEMES = [
  { id: "solid", name: "Cor Sólida", css: "bg-slate-200" },
  {
    id: "ocean",
    name: "Oceano",
    css: "bg-gradient-to-br from-cyan-400 to-blue-500",
  },
  {
    id: "sunset",
    name: "Pôr do Sol",
    css: "bg-gradient-to-br from-orange-400 to-rose-400",
  },
  {
    id: "dark",
    name: "Elegância",
    css: "bg-gradient-to-br from-slate-900 via-slate-800 to-black",
  },
];

const SOLID_COLORS = ["#000000", "#FFFFFF", "#2563EB", "#DB2777", "#16A34A"];

export function ThemeSettings({ data, onChange }: any) {
  return (
    <Card className="border-0 shadow-none bg-transparent md:border md:shadow-sm md:bg-card">
      <CardHeader className="px-0 pt-0 md:pt-6 md:px-6 pb-4">
        <CardTitle className="text-lg flex items-center gap-2 text-foreground">
          <Palette className="h-5 w-5 text-primary" />
          Aparência e Temas
        </CardTitle>
        <CardDescription>Escolha um fundo para a sua página.</CardDescription>
      </CardHeader>
      <CardContent className="px-0 pb-0 md:pb-6 md:px-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <Label className="text-foreground font-medium">
            Temas do Sistema
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {SYSTEM_THEMES.map((theme) => (
              <button
                key={theme.id}
                onClick={() =>
                  onChange({ ...data, id: theme.id, css: theme.css })
                }
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-xl border-2 p-2 transition-all outline-none",
                  data.id === theme.id
                    ? "border-primary bg-primary/5"
                    : "border-border/50 bg-card hover:border-primary/50",
                )}
              >
                <div
                  className={cn(
                    "w-full h-24 rounded-lg shadow-sm flex items-center justify-center relative overflow-hidden",
                    theme.id === "solid" && data.id === "solid"
                      ? ""
                      : theme.css,
                  )}
                  style={
                    theme.id === "solid" && data.id === "solid"
                      ? { backgroundColor: data.color }
                      : {}
                  }
                >
                  {data.id === theme.id && (
                    <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
                      <div className="bg-background/80 backdrop-blur-sm rounded-full p-1 shadow-sm">
                        <Check className="h-4 w-4 text-foreground" />
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-xs font-medium text-foreground">
                  {theme.name}
                </span>
              </button>
            ))}
          </div>
        </div>
        {data.id === "solid" && (
          <div className="flex flex-col gap-3 pt-4 border-t border-border/50 animate-in fade-in slide-in-from-top-2">
            <Label className="text-foreground font-medium">
              Personalize sua Cor
            </Label>
            <div className="flex flex-wrap items-center gap-3">
              {SOLID_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => onChange({ ...data, color })}
                  className={cn(
                    "h-10 w-10 rounded-full border-2 shadow-sm transition-transform hover:scale-110 flex items-center justify-center",
                    data.color === color
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border/50",
                  )}
                  style={{ backgroundColor: color }}
                >
                  {data.color === color && (
                    <Check
                      className={
                        color === "#FFFFFF"
                          ? "text-black h-4 w-4"
                          : "text-white h-4 w-4"
                      }
                    />
                  )}
                </button>
              ))}
              <div className="h-8 w-px bg-border mx-1" />
              <div className="relative h-10 w-10 rounded-full overflow-hidden border-2 border-border/50 shadow-sm cursor-pointer hover:scale-110 transition-transform">
                <input
                  type="color"
                  value={data.color}
                  onChange={(e) => onChange({ ...data, color: e.target.value })}
                  className="absolute -top-2 -left-2 h-16 w-16 cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
