import { NextResponse } from "next/server"
import {
  getTodayCheckIns,
  getActiveClientsCount,
  getPackagesEndingSoon,
  getAllCheckIns,
  getAllClients,
} from "@/lib/data"

export async function GET() {
  const todayCheckIns = getTodayCheckIns()
  const activeClients = getActiveClientsCount()
  const packagesEndingSoon = getPackagesEndingSoon()
  const recentCheckIns = getAllCheckIns().slice(0, 10)
  const clients = getAllClients()

  // Enrich check-ins with client names
  const enrichedCheckIns = recentCheckIns.map(ci => {
    const client = clients.find(c => c.id === ci.client_id)
    return {
      ...ci,
      client_name: client?.name || "Desconhecido",
    }
  })

  return NextResponse.json({
    todayCheckInsCount: todayCheckIns.length,
    activeClientsCount: activeClients,
    packagesEndingSoonCount: packagesEndingSoon.length,
    recentCheckIns: enrichedCheckIns,
  })
}
