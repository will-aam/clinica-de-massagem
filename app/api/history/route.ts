import { NextResponse } from "next/server"
import { getAllCheckIns, getAllClients } from "@/lib/data"

export async function GET() {
  const checkIns = getAllCheckIns()
  const clients = getAllClients()

  const enriched = checkIns.map(ci => {
    const client = clients.find(c => c.id === ci.client_id)
    return {
      ...ci,
      client_name: client?.name || "Desconhecido",
      client_cpf: client?.cpf || "",
    }
  })

  return NextResponse.json(enriched)
}
