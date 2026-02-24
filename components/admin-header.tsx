"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

export function AdminHeader({ title }: { title: string }) {
  return (
    <header className="flex h-14 items-center gap-3 border-b border-border bg-card px-4">
      <SidebarTrigger className="text-card-foreground" />
      <Separator orientation="vertical" className="h-5" />
      <h1 className="text-lg font-semibold text-card-foreground">{title}</h1>
    </header>
  )
}
