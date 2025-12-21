import { NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'

export async function POST() {
    try {
        await clearAuthCookie()

        return NextResponse.json({
            success: true,
            message: 'Logged out successfully',
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Logout failed' },
            { status: 500 }
        )
    }
}
