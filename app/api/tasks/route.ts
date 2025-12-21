import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    dueDate: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    isPublic: z.boolean().optional(),
    assignedUserIds: z.array(z.string()).optional(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(false) // Company context now optional
        const body = await request.json()
        const { title, description, dueDate, priority, isPublic, assignedUserIds } = createTaskSchema.parse(body)
        const companyId = user.companyId || null

        // If assigning users in a company context, verify they belong to the company
        if (companyId && assignedUserIds && assignedUserIds.length > 0) {
            const memberCount = await prisma.teamMembership.count({
                where: {
                    companyId,
                    userId: { in: assignedUserIds }
                }
            })
            if (memberCount !== assignedUserIds.length) {
                return NextResponse.json(
                    { success: false, error: 'One or more assigned users are not members of this team' },
                    { status: 400 }
                )
            }
        }

        const task = await prisma.task.create({
            data: {
                title,
                description: description || null,
                dueDate: dueDate ? new Date(dueDate) : null,
                priority: priority || 'MEDIUM',
                isPublic: isPublic ?? false,
                creatorId: user.userId,
                companyId,
                assignedUsers: assignedUserIds && assignedUserIds.length > 0 ? {
                    create: assignedUserIds.map((id: string) => ({
                        userId: id,
                    })),
                } : undefined,
            },
            include: {
                creator: { select: { id: true, email: true, name: true } },
                assignedUsers: { include: { user: { select: { id: true, email: true, name: true } } } },
            },
        })

        return NextResponse.json({
            success: true,
            data: task,
            message: 'Task created successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to create task' },
            { status: 500 }
        )
    }
}

export async function GET(request: NextRequest) {
    try {
        const user = await requireAuth(false) // Company context optional
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const search = searchParams.get('search')
        const assignedToMe = searchParams.get('assignedToMe') === 'true'
        const publicOnly = searchParams.get('publicOnly') === 'true'
        const personalOnly = searchParams.get('personalOnly') === 'true'

        const skip = (page - 1) * limit

        // Build base filters
        const where: any = {}

        if (personalOnly) {
            where.companyId = null
            where.creatorId = user.userId
        } else if (user.companyId) {
            where.companyId = user.companyId
        } else if (!assignedToMe) {
            // If no company context and not specifically asking for assigned to me, 
            // default to personal tasks
            where.companyId = null
            where.creatorId = user.userId
        }

        if (status) where.status = status
        if (priority) where.priority = priority

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ]
        }

        // Logic for visibility within company
        if (where.companyId) {
            if (publicOnly) {
                where.isPublic = true
            } else if (assignedToMe) {
                where.OR = [
                    { assignedUsers: { some: { userId: user.userId } } },
                    { creatorId: user.userId }
                ]
            } else if (user.teamRole !== 'ADMIN' && user.teamRole !== 'OFFICER') {
                // Normal users see: Public tasks OR Tasks they are part of
                where.AND = [
                    { companyId: user.companyId },
                    {
                        OR: [
                            { isPublic: true },
                            { assignedUsers: { some: { userId: user.userId } } },
                            { creatorId: user.userId }
                        ]
                    }
                ]
            }
        } else if (assignedToMe && !personalOnly) {
            // In all-tasks view (no company selected), show all tasks assigned to user
            where.OR = [
                { assignedUsers: { some: { userId: user.userId } } },
                { creatorId: user.userId }
            ]
        }
        // Admins (if not filtering for my tasks or public only) see all in company

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    creator: { select: { id: true, email: true, name: true } },
                    assignedUsers: { include: { user: { select: { id: true, email: true, name: true } } } },
                },
            }),
            prisma.task.count({ where }),
        ])

        return NextResponse.json({
            success: true,
            data: tasks,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Failed to fetch tasks' },
            { status: 500 }
        )
    }
}
