import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const inviteSchema = z.object({
    email: z.string().email(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(true) // Enforce company context

        // Only admins can invite
        if (user.teamRole !== 'ADMIN') {
            return NextResponse.json({ success: false, error: 'Only admins can invite members' }, { status: 403 })
        }

        const body = await request.json()
        const { email } = inviteSchema.parse(body)

        // Find the user to invite
        const targetUser = await prisma.user.findUnique({
            where: { email }
        })

        if (!targetUser) {
            return NextResponse.json({ success: false, error: 'User not found in system. They must create an account first.' }, { status: 404 })
        }

        // Check if already a member of THIS company
        const existingMember = await prisma.teamMembership.findFirst({
            where: {
                companyId: user.companyId,
                userId: targetUser.id
            }
        })

        if (existingMember) {
            return NextResponse.json({ success: false, error: 'User is already a member of this team' }, { status: 400 })
        }

        // Create invitation
        const invitation = await prisma.invitation.upsert({
            where: {
                email_companyId: {
                    email,
                    companyId: user.companyId,
                }
            },
            update: {
                status: 'PENDING',
                inviterId: user.userId,
                userId: targetUser?.id || null,
            },
            create: {
                email,
                companyId: user.companyId,
                inviterId: user.userId,
                userId: targetUser?.id || null,
            }
        })

        return NextResponse.json({
            success: true,
            data: invitation,
            message: 'Invitation sent successfully',
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
