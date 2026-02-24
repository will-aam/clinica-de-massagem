"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CpfKeypad, formatCpf } from "@/components/cpf-keypad"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function TotemCheckInPage() {
  const router = useRouter()
  const [cpf, setCpf] = useState("")
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    const digits = cpf.replace(/\D/g, "")
    if (digits.length !== 11) return

    setLoading(true)
    try {
      const formatted = formatCpf(digits)
      const res = await fetch("/api/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: formatted }),
      })

      const data = await res.json()

      if (data.success) {
        const params = new URLSearchParams({
          name: data.client.name,
          used: String(data.package_info.used_sessions),
          total: String(data.package_info.total_sessions),
        })
        router.push(`/totem/success?${params.toString()}`)
      } else {
        const errorType = data.error || "UNKNOWN"
        router.push(`/totem/error?type=${errorType}`)
      }
    } catch {
      router.push("/totem/error?type=UNKNOWN")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 p-6">
      <div className="flex w-full items-center">
        <Link
          href="/totem/idle"
          className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Link>
      </div>

      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
          Check-in
        </h1>
        <p className="mt-2 text-muted-foreground leading-relaxed">
          Digite seu CPF para registrar sua presença
        </p>
      </div>

      <CpfKeypad
        value={cpf}
        onChange={setCpf}
        onConfirm={handleConfirm}
        disabled={loading}
      />

      {loading && (
        <p className="text-sm text-muted-foreground animate-pulse">
          Verificando...
        </p>
      )}
    </div>
  )
}
