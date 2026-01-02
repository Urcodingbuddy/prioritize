import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'
import { z } from 'zod'

const createTaskSchema = z.object({
    title: z.string().min(1),
    description: z.string().nullable().optional(),
    dueDate: z.string().nullable().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    isPublic: z.boolean().optional(),
    assignedUserIds: z.array(z.string()).optional(),
    companyId: z.string().optional(),
})

export async function POST(request: NextRequest) {
    try {
        const user = await requireAuth(false) // Company context now optional
        const body = await request.json()
        const { title, description, dueDate, priority, isPublic, assignedUserIds, companyId: bodyCompanyId } = createTaskSchema.parse(body)
        const companyId = bodyCompanyId || user.companyId || null

        // If companyId is provided, verify user is a member
        if (companyId) {
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_companyId: {
                        userId: user.userId,
                        companyId
                    }
                }
            })
            if (!membership) {
                return NextResponse.json(
                    { success: false, error: 'You do not have permission to create tasks in this team' },
                    { status: 403 }
                )
            }
        }

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
        const user = await requireAuth(false)
        const { searchParams } = new URL(request.url)

        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '10')
        const status = searchParams.get('status')
        const priority = searchParams.get('priority')
        const search = searchParams.get('search')
        const assignedToMe = searchParams.get('assignedToMe') === 'true'
        const publicOnly = searchParams.get('publicOnly') === 'true'
        const personalOnly = searchParams.get('personalOnly') === 'true'
        const companyIdParam = searchParams.get('companyId')

        const skip = (page - 1) * limit

        // Determine context
        let contextCompanyId: string | null = null
        let teamRole: string | null = null

        if (companyIdParam) {
            contextCompanyId = companyIdParam
        } else {
            // Fallback to cookie if not provided
            // We need to import getSelectedCompanyId but requireAuth doesn't return it if false.
            // Let's just rely on param or skip cookie for now to force explicit switching?
            // Actually, for backward compatibility, let's try to get it from cookie if we can,
            // but we can't easily import it here without changing imports. 
            // It's safer to rely on explicit params for strictness. 
            // If user.companyId existed on the user object, we could use it.
            // As established, requireAuth(false) doesn't return companyId.
        }

        // If we have a target company, validate membership
        if (contextCompanyId) {
            const membership = await prisma.teamMembership.findUnique({
                where: {
                    userId_companyId: {
                        userId: user.userId,
                        companyId: contextCompanyId
                    }
                },
                select: { role: true }
            })

            if (!membership) {
                return NextResponse.json(
                    { success: false, error: 'Not a member of this company' },
                    { status: 403 }
                )
            }
            teamRole = membership.role
        }

        const where: any = {}

        if (personalOnly) {
            where.companyId = null
            where.creatorId = user.userId
        } else if (contextCompanyId) {
            where.companyId = contextCompanyId

            // Team Visibility Logic
            if (publicOnly) {
                where.isPublic = true
            } else if (assignedToMe) {
                where.OR = [
                    { assignedUsers: { some: { userId: user.userId } } },
                    { creatorId: user.userId }
                ]
            } else if (teamRole !== 'ADMIN' && teamRole !== 'OFFICER') {
                // Normal users see: Public tasks OR Tasks they are part of
                where.AND = [
                    {
                        OR: [
                            { isPublic: true },
                            { assignedUsers: { some: { userId: user.userId } } },
                            { creatorId: user.userId }
                        ]
                    }
                ]
            }
        } else {
            // No company context and not personalOnly.
            // This is "All Tasks" view potentially.
            // Strict mode: If not requesting personalOnly, and no companyId, what do we return?
            // "My Corporate Tasks" usually implies "Current Team".
            // If we fall here, it means we have NO context. 
            // If assignedToMe is true, we originally leaked everything.

            // To fix the "leak", we must ensure that if the intent was "Team View", we HAVE context.
            // Since the client was failing to pass context, we ended up here.

            // For safety, let's default to "Personal Tasks" if no context is provided? 
            // OR we continue to allow global search but EXCLUDE personal tasks if not requested?

            // The user complaint is "Personal tasks visible in TEAM".
            // This implies they see Personal Tasks (companyId=null) mixed with Company Tasks.

            // If we strictly require companyId for Team queries, this branch only handles "Global Assigned".
            // We can exclude personal tasks here if we want?

            // Let's implement: If no companyId, return personal tasks (default behavior) OR global assigned?
            // Safest default:

            where.companyId = null
            where.creatorId = user.userId
        }

        if (status) where.status = status
        if (priority) where.priority = priority

        if (search) {
            const searchFilter = {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                ]
            }
            if (where.AND) {
                where.AND.push(searchFilter)
            } else {
                where.AND = [searchFilter]
            }
        }

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
