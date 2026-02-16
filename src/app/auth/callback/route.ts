import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        console.log('[Callback] Exchanging code for session...');
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) console.error('[Callback] Auth Error:', error.message);
        else console.log('[Callback] Session exchanged successfully');
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL('/app', request.url))
}
