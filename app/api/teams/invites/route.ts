import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth()

        const invites = await prisma.invitation.findMany({
            where: {
                email: user.email,
                status: 'PENDING'
            },
            include: {
                company: true
            }
        })

        return NextResponse.json({
            success: true,
            data: invites
        })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
