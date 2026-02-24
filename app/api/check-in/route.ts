import { NextResponse } from "next/server"
import { performCheckIn } from "@/lib/data"

export async function POST(request: Request) {
  const { cpf } = await request.json()

  if (!cpf) {
    return NextResponse.json({ success: false, error: "CPF_REQUIRED" }, { status: 400 })
  }

  const result = performCheckIn(cpf)
  if (!result.success) {
    return NextResponse.json(result, { status: 404 })
  }

  return NextResponse.json(result)
}
