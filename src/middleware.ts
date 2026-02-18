import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
// Basic file logging for debug
// In Edge middleware fs might not work directly, but let's try or use console if fails.
// Actually middleware runs on Edge runtime usually, fs is not available.
// So this might break middleware. 

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })

    const {
        data: { session },
    } = await supabase.auth.getSession()

    console.log(`[Middleware] Path: ${req.nextUrl.pathname}, Session: ${!!session}`);

    // Если нет сессии и мы пытаемся зайти на защищенный маршрут
    if (!session && req.nextUrl.pathname.startsWith('/app')) {
        // Редирект на страницу входа
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/login'
        return NextResponse.redirect(redirectUrl)
    }

    // Если есть сессия и мы на странице входа - редирект в приложение
    if (session && req.nextUrl.pathname === '/login') {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/app'
        return NextResponse.redirect(redirectUrl)
    }

    return res
}

export const config = {
    matcher: [
        '/app/:path*',
        '/login'
    ],
}
