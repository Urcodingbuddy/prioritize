import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken, setAuthCookie } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password } = loginSchema.parse(body)

        const user = await prisma.user.findUnique({
            where: { email },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const isValidPassword = await comparePassword(password, user.password)

        if (!isValidPassword) {
            return NextResponse.json(
                { success: false, error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        const token = generateToken({ userId: user.id, email: user.email, role: user.role })
        await setAuthCookie(token)

        return NextResponse.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
            },
            message: 'Login successful',
        })
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid input', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Login failed' },
            { status: 500 }
        )
    }
}
