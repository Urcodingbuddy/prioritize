import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, setCurrentCompany } from '@/lib/auth'
import { z } from 'zod'

const acceptSchema = z.object({
    invitationId: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const { invitationId } = acceptSchema.parse(body)

        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId },
            include: { company: true }
        })

        if (!invitation || invitation.email !== user.email || invitation.status !== 'PENDING') {
            return NextResponse.json({ success: false, error: 'Invalid invitation' }, { status: 400 })
        }

        // Add to company
        await prisma.$transaction([
            prisma.teamMembership.create({
                data: {
                    userId: user.userId,
                    companyId: invitation.companyId,
                    role: 'USER',
                }
            }),
            prisma.invitation.update({
                where: { id: invitationId },
                data: { status: 'ACCEPTED' }
            })
        ])

        // Switch to the new company automatically
        await setCurrentCompany(invitation.companyId)

        return NextResponse.json({
            success: true,
            message: 'Joined team successfully',
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
