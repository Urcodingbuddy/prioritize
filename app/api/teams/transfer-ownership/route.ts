import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const transferSchema = z.object({
    newOwnerId: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const { userId: currentUserId, companyId, teamRole } = await requireAuth(true)

        // Only Admin (owner) can transfer ownership
        if (teamRole !== 'ADMIN') {
            return NextResponse.json(
                { success: false, error: 'Only the team owner can transfer ownership' },
                { status: 403 }
            )
        }

        const body = await request.json()
        const { newOwnerId } = transferSchema.parse(body)

        // Get the new owner's membership
        const newOwnerMembership = await prisma.teamMembership.findUnique({
            where: {
                userId_companyId: {
                    userId: newOwnerId,
                    companyId
                }
            }
        })

        if (!newOwnerMembership) {
            return NextResponse.json(
                { success: false, error: 'User is not a member of this team' },
                { status: 400 }
            )
        }

        // Check if the new owner is an Officer
        if (newOwnerMembership.role !== 'OFFICER') {
            return NextResponse.json(
                { success: false, error: 'Ownership can only be transferred to an Officer' },
                { status: 400 }
            )
        }

        // Check 7-day rule
        const joinedDate = new Date(newOwnerMembership.joinedAt)
        const daysSinceJoined = Math.floor(
            (Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24)
        )

        if (daysSinceJoined < 7) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Officer must be a member for at least 7 days. Current: ${daysSinceJoined} days.`
                },
                { status: 400 }
            )
        }

        // Perform the transfer in a transaction
        await prisma.$transaction([
            // Demote current owner to Officer
            prisma.teamMembership.update({
                where: {
                    userId_companyId: {
                        userId: currentUserId,
                        companyId
                    }
                },
                data: { role: 'OFFICER' }
            }),
            // Promote new owner to Admin
            prisma.teamMembership.update({
                where: {
                    userId_companyId: {
                        userId: newOwnerId,
                        companyId
                    }
                },
                data: { role: 'ADMIN' }
            })
        ])

        return NextResponse.json({
            success: true,
            message: 'Ownership transferred successfully'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to transfer ownership' },
            { status: 500 }
        )
    }
}
