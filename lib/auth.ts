import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const SALT_ROUNDS = 10

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS)
}  
export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
}

export function generateToken(payload: { userId: string, email: string, role: string }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): any {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch {
        return null
    }
}

export async function setAuthCookie(token: string) {
    const cookieStore = await cookies()
    cookieStore.set('auth-token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
    })
}

export async function clearAuthCookie() {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
    cookieStore.delete('current-company-id')
}

export async function setCurrentCompany(companyId: string) {
    const cookieStore = await cookies()
    cookieStore.set('current-company-id', companyId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
    })
}

export async function getSelectedCompanyId(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('current-company-id')?.value || null
}

export async function getAuthToken(): Promise<string | null> {
    const cookieStore = await cookies()
    return cookieStore.get('auth-token')?.value || null
}

export async function getCurrentUser() {
    const token = await getAuthToken()
    if (!token) return null
    return verifyToken(token)
}

export async function requireAuth(enforceCompany = false) {
    const user = await getCurrentUser()
    if (!user) {
        throw new Error('Unauthorized')
    }

    if (enforceCompany) {
        const companyId = await getSelectedCompanyId()
        if (!companyId) {
            throw new Error('Company context required')
        }

        // Fetch membership to get team-specific role
        const membership = await prisma.teamMembership.findUnique({
            where: {
                userId_companyId: {
                    userId: user.userId,
                    companyId: companyId,
                }
            }
        })

        if (!membership) {
            throw new Error('Not a member of this company')
        }

        return { ...user, companyId, teamRole: membership.role }
    }

    return user
}
