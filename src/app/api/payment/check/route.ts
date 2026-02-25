import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(request: Request) {
    try {
        const { paymentId } = await request.json();

        if (!paymentId) {
            return NextResponse.json({ error: 'Missing paymentId' }, { status: 400 });
        }

        // 1. Check Auth
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;

        // 2. Add Service Role Client for secure database reads
        const supabaseAdmin = createClient(
            NEXT_PUBLIC_SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false
                }
            }
        );

        // 3. Check Payment Status in our DB (Webhook should have updated it)
        const { data: payment, error } = await supabaseAdmin
            .from('payments')
            .select('*')
            .eq('id', paymentId)
            .single();

        if (error || !payment) {
            console.error('Payment DB Check Error:', error);
            return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
        }

        // Double check user match
        if (payment.user_id !== userId) {
            return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
        }

        // 4. Return Status
        if (payment.status === 'succeeded' || payment.status === 'paid') {
            return NextResponse.json({ success: true, plan: payment.plan_id });
        } else if (payment.status === 'pending') {
            return NextResponse.json({ success: false, status: 'pending' });
        } else {
            return NextResponse.json({ success: false, status: payment.status });
        }

    } catch (error) {
        console.error('Payment Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
