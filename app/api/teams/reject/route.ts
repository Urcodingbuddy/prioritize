import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const { invitationId } = body

        if (!invitationId) {
            return NextResponse.json({ success: false, error: 'Invitation ID required' }, { status: 400 })
        }

        const invitation = await prisma.invitation.findUnique({
            where: { id: invitationId }
        })

        if (!invitation || invitation.email !== user.email) {
            return NextResponse.json({ success: false, error: 'Invitation not found' }, { status: 404 })
        }

        await prisma.invitation.delete({
            where: { id: invitationId }
        })

        return NextResponse.json({
            success: true,
            message: 'Invitation declined'
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to reject invitation' },
            { status: 500 }
        )
    }
}
