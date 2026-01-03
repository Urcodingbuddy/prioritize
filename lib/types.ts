export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'
export type Role = 'USER' | 'ADMIN' | 'OFFICER'

export interface User {
    id: string
    email: string
    name: string
    role?: Role
    avatar?: string
    createdAt: Date
    updatedAt: Date
    memberships?: TeamMembership[]
    currentCompanyId?: string | null
}

export interface Company {
    id: string
    name: string
    createdAt: Date
    updatedAt: Date
}

export interface TeamMembership {
    id: string
    userId: string
    companyId: string
    role: Role
    joinedAt: Date
    company: Company
}

export interface Task {
    id: string
    title: string
    description: string | null
    dueDate: Date | null
    status: Status
    priority: Priority
    isPublic: boolean
    companyId: string
    createdAt: Date
    updatedAt: Date
    creatorId: string
    creator?: User
    assignedUsers?: UserTask[]
}

export interface UserTask {
    id: string
    userId: string
    taskId: string
    assignedAt: Date
    user?: User
    task?: Task
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    error?: string
    message?: string
}
