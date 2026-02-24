import { NextResponse } from "next/server"
import { getAllClients, createClient, getClientByCpf } from "@/lib/data"

export async function GET() {
  const clients = getAllClients()
  return NextResponse.json(clients)
}

export async function POST(request: Request) {
  const data = await request.json()

  if (!data.name || !data.cpf || !data.phone_whatsapp || !data.total_sessions) {
    return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
  }

  const existing = getClientByCpf(data.cpf)
  if (existing) {
    return NextResponse.json({ error: "CPF já cadastrado" }, { status: 409 })
  }

  const client = createClient(data)
  return NextResponse.json(client, { status: 201 })
}
