import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const updateTaskSchema = z.object({
    title: z.string().min(1).optional(),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedUserIds: z.array(z.string()).optional(),
})

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(true)
        const { id } = await params

        const task = await prisma.task.findUnique({
            where: { id },
            include: {
                creator: true,
                assignedUsers: true,
            },
        })

        if (!task) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
        }

        // Permission check
        const isAssigned = task.assignedUsers.some((ut) => ut.userId === user.userId)
        const isCreator = task.creatorId === user.userId
        const isAdmin = user.teamRole === 'ADMIN'
        const isOfficer = user.teamRole === 'OFFICER'

        if (!isAdmin && !isOfficer && !isAssigned && !isCreator && !task.isPublic) {
            return NextResponse.json({ success: false, error: 'Access denied' }, { status: 403 })
        }

        return NextResponse.json({ success: true, data: task })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(true)
        const { id } = await params

        const existingTask = await prisma.task.findUnique({
            where: { id },
            include: { assignedUsers: true }
        })

        if (!existingTask) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
        }

        const isAdmin = user.teamRole === 'ADMIN'
        const isOfficer = user.teamRole === 'OFFICER'
        const isCreator = existingTask.creatorId === user.userId
        const isAssigned = existingTask.assignedUsers.some(ut => ut.userId === user.userId)

        if (!isAdmin && !isOfficer && !isCreator && !isAssigned) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const updates = updateTaskSchema.parse(body)
        const data: any = {}

        if (updates.title !== undefined) data.title = updates.title
        if (updates.description !== undefined) data.description = updates.description
        if (updates.dueDate !== undefined) data.dueDate = updates.dueDate ? new Date(updates.dueDate) : null
        if (updates.status !== undefined) data.status = updates.status
        if (updates.priority !== undefined) data.priority = updates.priority

        if (updates.assignedUserIds !== undefined) {
            // Verify all assigned users belong to the company
            if (updates.assignedUserIds.length > 0) {
                const memberCount = await prisma.teamMembership.count({
                    where: {
                        companyId: user.companyId,
                        userId: { in: updates.assignedUserIds }
                    }
                })
                if (memberCount !== updates.assignedUserIds.length) {
                    return NextResponse.json(
                        { success: false, error: 'One or more assigned users are not members of this team' },
                        { status: 400 }
                    )
                }
            }

            await prisma.userTask.deleteMany({ where: { taskId: id } })
            if (updates.assignedUserIds.length > 0) {
                data.assignedUsers = {
                    create: updates.assignedUserIds.map((userId) => ({ userId })),
                }
            }
        }

        const task = await prisma.task.update({
            where: { id },
            data,
            include: {
                creator: { select: { id: true, email: true, name: true } },
                assignedUsers: { include: { user: { select: { id: true, email: true, name: true } } } },
            },
        })

        return NextResponse.json({ success: true, data: task })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await requireAuth(true)
        const { id } = await params

        const task = await prisma.task.findUnique({ where: { id } })
        if (!task) {
            return NextResponse.json({ success: false, error: 'Task not found' }, { status: 404 })
        }

        const isAdmin = user.teamRole === 'ADMIN'
        const isOfficer = user.teamRole === 'OFFICER'
        const isCreator = task.creatorId === user.userId

        if (!isAdmin && !isOfficer && !isCreator) {
            return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
        }

        await prisma.task.delete({ where: { id } })
        return NextResponse.json({ success: true, message: 'Deleted' })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
