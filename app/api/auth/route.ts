import { NextResponse } from "next/server"
import { getAdminByEmail } from "@/lib/data"

export async function POST(request: Request) {
  const { email, password } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ error: "Credenciais obrigatórias" }, { status: 400 })
  }

  const admin = getAdminByEmail(email)
  if (!admin || admin.password !== password) {
    return NextResponse.json({ error: "E-mail ou senha inválidos" }, { status: 401 })
  }

  return NextResponse.json({ success: true, admin: { id: admin.id, email: admin.email } })
}
