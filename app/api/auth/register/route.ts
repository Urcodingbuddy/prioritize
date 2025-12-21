import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, setAuthCookie, setCurrentCompany } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
    companyName: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { email, password, name, companyName } = registerSchema.parse(body)

        const existingUser = await prisma.user.findUnique({
            where: { email },
        })

        if (existingUser) {
            return NextResponse.json(
                { success: false, error: 'User already exists' },
                { status: 400 }
            )
        }

        const hashedPassword = await hashPassword(password)

        // Use a transaction to ensure both user and company/membership are created
        const result = await prisma.$transaction(async (tx:any) => {
            const user = await tx.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true,
                },
            })

            let company = null
            if (companyName) {
                company = await tx.company.create({
                    data: {
                        name: companyName,
                        members: {
                            create: {
                                userId: user.id,
                                role: 'ADMIN',
                            }
                        }
                    }
                })
            }

            return { user, company }
        })

        const token = generateToken({ userId: result.user.id, email: result.user.email, role: result.user.role })
        await setAuthCookie(token)

        if (result.company) {
            await setCurrentCompany(result.company.id)
        }

        return NextResponse.json({
            success: true,
            data: {
                ...result.user,
                company: result.company,
            },
            message: companyName ? 'Admin and Company registered successfully' : 'User registered successfully',
        })
    } catch (error: any) {
        console.error('Registration error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid input', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Registration failed' },
            { status: 500 }
        )
    }
}
