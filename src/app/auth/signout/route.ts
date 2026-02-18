import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Определяем URL для редиректа, используя заголовки, чтобы избежать 0.0.0.0
    const requestUrl = new URL(request.url)
    const host = request.headers.get('host') ?? requestUrl.host
    const protocol = request.headers.get('x-forwarded-proto') ?? requestUrl.protocol.replace(':', '')

    // Выходим из аккаунта
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
    await supabase.auth.signOut()

    return NextResponse.redirect(`${protocol}://${host}/login`, {
        status: 302,
    })
}
