import { NextResponse } from 'next/server'
import { getCurrentUser, getSelectedCompanyId } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
    try {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { id: currentUser.userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                memberships: {
                    include: {
                        company: {
                            include: {
                                tasks: {
                                    select: {
                                        priority: true,
                                        status: true,
                                    }
                                }
                            }
                        }
                    }
                }
            },
        })

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            )
        }

        const currentCompanyId = await getSelectedCompanyId()

        return NextResponse.json({
            success: true,
            data: {
                ...user,
                currentCompanyId,
            },
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to get user' },
            { status: 500 }
        )
    }
}

export async function PATCH(request: Request) {
    try {
        const currentUser = await getCurrentUser()

        if (!currentUser) {
            return NextResponse.json(
                { success: false, error: 'Not authenticated' },
                { status: 401 }
            )
        }

        const body = await request.json()
        const { avatar, name } = body

        const updatedUser = await prisma.user.update({
            where: { id: currentUser.userId },
            data: {
                ...(avatar && { avatar }),
                ...(name && { name }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
                role: true,
            }
        })

        return NextResponse.json({
            success: true,
            data: updatedUser
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to update user' },
            { status: 500 }
        )
    }
}
