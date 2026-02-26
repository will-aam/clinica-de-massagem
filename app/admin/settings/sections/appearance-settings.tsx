"use client";

import { useTheme } from "next-themes";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Palette } from "lucide-react";

export function AppearanceSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <Palette className="h-5 w-5 text-primary" />
          Aparência
        </CardTitle>
        <CardDescription>
          Personalize a aparência do sistema entre o modo claro e escuro.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4">
          <button
            onClick={() => setTheme("light")}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 transition-all ${
              theme === "light"
                ? "border-primary bg-card ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "border-border bg-muted hover:border-primary/50"
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm" />
            <span className="mt-2 text-sm font-medium text-foreground">
              Claro
            </span>
          </button>

          <button
            onClick={() => setTheme("dark")}
            className={`flex h-24 w-24 flex-col items-center justify-center rounded-xl border-2 transition-all ${
              theme === "dark"
                ? "border-primary bg-card ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "border-border bg-muted hover:border-primary/50"
            }`}
          >
            <div className="h-10 w-10 rounded-full bg-zinc-950 border border-zinc-800 shadow-sm" />
            <span className="mt-2 text-sm font-medium text-foreground">
              Escuro
            </span>
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
