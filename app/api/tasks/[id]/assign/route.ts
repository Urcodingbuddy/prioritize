import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const assignSchema = z.object({
    userIds: z.array(z.string()),
})

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth()
        const { id } = await params
        const body = await request.json()
        const { userIds } = assignSchema.parse(body)

        const task = await prisma.task.findUnique({
            where: { id },
        })

        if (!task) {
            return NextResponse.json(
                { success: false, error: 'Task not found' },
                { status: 404 }
            )
        }

        const assignments = await Promise.all(
            userIds.map((userId: string) =>
                prisma.userTask.upsert({
                    where: {
                        userId_taskId: {
                            userId,
                            taskId: id,
                        },
                    },
                    create: {
                        userId,
                        taskId: id,
                    },
                    update: {},
                })
            )
        )

        return NextResponse.json({
            success: true,
            data: assignments,
            message: 'Users assigned successfully',
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
            { success: false, error: error.message || 'Failed to assign users' },
            { status: 500 }
        )
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAuth()
        const { id } = await params
        const { searchParams } = new URL(request.url)
        const userId = searchParams.get('userId')

        if (!userId) {
            return NextResponse.json(
                { success: false, error: 'userId parameter required' },
                { status: 400 }
            )
        }

        await prisma.userTask.delete({
            where: {
                userId_taskId: {
                    userId,
                    taskId: id,
                },
            },
        })

        return NextResponse.json({
            success: true,
            message: 'User unassigned successfully',
        })
    } catch (error: any) {
        if (error.message === 'Unauthorized') {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        return NextResponse.json(
            { success: false, error: error.message || 'Failed to unassign user' },
            { status: 500 }
        )
    }
}
