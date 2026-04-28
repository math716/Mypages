import { NextResponse } from "next/server"
import prisma from "@/lib/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha s\u00e3o obrigat\u00f3rios" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Usu\u00e1rio j\u00e1 existe" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName || null,
        lastName: lastName || null,
      }
    })

    return NextResponse.json(
      { 
        message: "Usu\u00e1rio criado com sucesso",
        user: { id: user.id, email: user.email }
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Erro ao criar usu\u00e1rio" },
      { status: 500 }
    )
  }
}