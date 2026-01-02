import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function proxy(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
        if (request.nextUrl.pathname.startsWith('/home') ||
            request.nextUrl.pathname.startsWith('/admin') ||
            request.nextUrl.pathname.startsWith('/teams') ||
            request.nextUrl.pathname.startsWith('/tasks') ||
            request.nextUrl.pathname.startsWith('/my-tasks')) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    // Redirect authenticated users from login/register to home
    if (token) {
        if (request.nextUrl.pathname === '/login' ||
            request.nextUrl.pathname === '/register') {
            return NextResponse.redirect(new URL('/home', request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        '/',
        '/login',
        '/register',
        '/home/:path*',
        '/admin/:path*',
        '/teams/:path*',
        '/tasks/:path*',
        '/my-tasks/:path*'
    ],
}
