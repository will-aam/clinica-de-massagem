"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2 } from "lucide-react"

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [countdown, setCountdown] = useState(5)

  const name = searchParams.get("name") || "Cliente"
  const used = Number(searchParams.get("used") || 0)
  const total = Number(searchParams.get("total") || 10)
  const progress = Math.round((used / total) * 100)
  const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          router.push("/totem/idle")
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [router])

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 p-6 text-center">
      {/* Success Icon */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/20">
        <CheckCircle2 className="h-14 w-14 text-primary" />
      </div>

      {/* Client Name */}
      <div>
        <p className="text-lg text-muted-foreground">Bem-vinda,</p>
        <h1 className="font-serif text-4xl font-bold text-foreground md:text-5xl">
          {name}
        </h1>
      </div>

      {/* Check-in time */}
      <p className="text-muted-foreground">
        {"Check-in realizado às "}
        <span className="font-semibold text-foreground">{time}</span>
      </p>

      {/* Package Progress */}
      <div className="w-full rounded-xl border border-border bg-card p-6">
        <p className="mb-3 text-lg font-semibold text-card-foreground">
          {`Sessão ${used} de ${total} concluída!`}
        </p>
        <Progress value={progress} className="h-4" />
        <p className="mt-2 text-sm text-muted-foreground">
          {total - used > 0
            ? `${total - used} sessões restantes`
            : "Pacote concluído!"}
        </p>
      </div>

      {/* Auto redirect countdown */}
      <p className="text-sm text-muted-foreground">
        {`Redirecionando em ${countdown} segundos...`}
      </p>
    </div>
  )
}

export default function TotemSuccessPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center p-6">
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}
