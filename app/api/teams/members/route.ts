import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateMemberSchema = z.object({
    userId: z.string(),
    role: z.enum(['USER', 'ADMIN', 'OFFICER']),
})

export async function GET() {
    try {
        const { companyId } = await requireAuth(true)

        const members = await prisma.teamMembership.findMany({
            where: { companyId },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                    }
                }
            },
            orderBy: { joinedAt: 'desc' }
        })

        const formattedMembers = members.map((m: any) => ({
            id: m.userId,
            email: m.user.email,
            name: m.user.name,
            role: m.role,
            joinedAt: m.joinedAt
        }))

        return NextResponse.json({
            success: true,
            data: formattedMembers,
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch members' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const { userId: currentUserId, companyId, teamRole } = await requireAuth(true)

        if (teamRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Only admins can manage roles' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { userId, role } = updateMemberSchema.parse(body)

        // Prevent self-management of roles
        if (userId === currentUserId) {
            return NextResponse.json(
                { success: false, error: 'You cannot change your own role' },
                { status: 400 }
            )
        }

        await prisma.teamMembership.update({
            where: {
                userId_companyId: {
                    userId,
                    companyId
                }
            },
            data: { role }
        })

        return NextResponse.json({
            success: true,
            message: 'Member role updated'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update member' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId: currentUserId, companyId, teamRole } = await requireAuth(true)

        if (teamRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Only admins can remove members' },
                { status: 403 }
            )
        }

        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'User ID required' },
                { status: 400 }
            )
        }

        // Prevent self-removal
        if (userId === currentUserId) {
            return NextResponse.json(
                { success: false, error: 'You cannot remove yourself from the management page' },
                { status: 400 }
            )
        }

        await prisma.teamMembership.delete({
            where: {
                userId_companyId: {
                    userId,
                    companyId
                }
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Member removed successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to remove member' },
            { status: 500 }
        )
    }
}
