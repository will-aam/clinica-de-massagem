import { NextResponse } from "next/server"
import {
  getClientById,
  getPackagesForClient,
  getCheckInsForClient,
  getActivePackageForClient,
  deleteClient,
  addPackageToClient,
} from "@/lib/data"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const client = getClientById(id)
  if (!client) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }

  const packages = getPackagesForClient(id)
  const checkIns = getCheckInsForClient(id)
  const activePackage = getActivePackageForClient(id)

  return NextResponse.json({ client, packages, checkIns, activePackage })
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const deleted = deleteClient(id)
  if (!deleted) {
    return NextResponse.json({ error: "Cliente não encontrado" }, { status: 404 })
  }
  return NextResponse.json({ success: true })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { total_sessions } = await request.json()

  if (!total_sessions) {
    return NextResponse.json({ error: "Total de sessões obrigatório" }, { status: 400 })
  }

  const pkg = addPackageToClient(id, total_sessions)
  return NextResponse.json(pkg, { status: 201 })
}
