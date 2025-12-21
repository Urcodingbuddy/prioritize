import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        if (request.nextUrl.pathname.startsWith('/dashboard') ||
            request.nextUrl.pathname.startsWith('/admin') ||
            request.nextUrl.pathname.startsWith('/teams') ||
            request.nextUrl.pathname.startsWith('/tasks')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect authenticated users from login/register to dashboard
    if (token) {
        if (request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/register') {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/dashboard/:path*',
        '/admin/:path*',
        '/teams/:path*',
        '/tasks/:path*'
    ],
}
