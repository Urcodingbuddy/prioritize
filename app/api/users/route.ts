import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, hashPassword, getSelectedCompanyId } from '@/lib/auth'
import { z } from 'zod'

const createUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(1),
})

export async function GET() {
    try {
        const currentUser = await requireAuth(false)
        const companyId = await getSelectedCompanyId()

        if (companyId) {
            // Return only team members
            const projectMembers = await prisma.teamMembership.findMany({
                where: { companyId },
                include: { user: true }
            })
            return NextResponse.json({
                success: true,
                data: projectMembers.map(m => ({
                    id: m.userId,
                    email: m.user.email,
                    name: m.user.name,
                    role: m.role
                }))
            })
        }

        // Return only current user if no company context
        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: { id: true, email: true, name: true }
        })

        return NextResponse.json({
            success: true,
            data: user ? [user] : [],
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch users' },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const { teamRole } = await requireAuth(true)

        if (teamRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { email, password, name } = createUserSchema.parse(body)

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

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        })

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User created successfully',
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, error: 'Invalid input', details: error.issues },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create user' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { teamRole } = await requireAuth(true)

        if (teamRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Admin access required' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('id')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            )
        }

        await prisma.user.delete({
            where: { id: userId },
        })

        return NextResponse.json({
            success: true,
            message: 'User deleted successfully',
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to delete user' },
            { status: 500 }
        )
    }
}
