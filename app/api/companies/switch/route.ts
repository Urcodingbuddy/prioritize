import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, setCurrentCompany } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const switchSchema = z.object({
    companyId: z.string(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const { companyId } = switchSchema.parse(body)

        // Verify user is member of this company
        const membership = await prisma.teamMembership.findUnique({
            where: {
                userId_companyId: {
                    userId: user.userId,
                    companyId: companyId,
                }
            }
        })

        if (!membership) {
            return NextResponse.json(
                { success: false, error: 'Not a member of this team' },
                { status: 403 }
            )
        }

        await setCurrentCompany(companyId)

        return NextResponse.json({
            success: true,
            message: 'Switched company context successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to switch company' },
            { status: 500 }
        )
    }
}
