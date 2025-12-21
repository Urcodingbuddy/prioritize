import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth, setCurrentCompany } from '@/lib/auth'
import { z } from 'zod'

const companySchema = z.object({
    name: z.string().min(1),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth()
        const body = await request.json()
        const { name } = companySchema.parse(body)

        const company = await prisma.company.create({
            data: {
                name,
                members: {
                    create: {
                        userId: user.userId,
                        role: 'ADMIN',
                    }
                }
            }
        })

        // Automatically switch to the new company
        await setCurrentCompany(company.id)

        return NextResponse.json({
            success: true,
            data: company,
            message: 'Company created and switched successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create company' },
            { status: 500 }
        )
    }
}
