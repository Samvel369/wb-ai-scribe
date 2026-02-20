import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const YOOKASSA_SHOP_ID = process.env.DTO_YOOKASSA_SHOP_ID?.trim();
const YOOKASSA_SECRET_KEY = process.env.DTO_YOOKASSA_SECRET_KEY?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

// We need a Service Role Client to update other users or bypass strict RLS if needed,
// but usually Route Handler with User Session works fine for updating OWN profile IF policies allow.
// However, to be safe and authoritative, we'll use Service Role if available, 
// or standard client if we trust the user to update their own (risk: they could call this API manually? 
// No, because we verify with YooKassa first!).

import { createClient } from '@supabase/supabase-js';

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

        // 2. Add Service Role Client for database updates
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

        // 3. Verify Payment with YooKassa
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');
        const response = await fetch(`https://api.yookassa.ru/v3/payments/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            console.error('YooKassa Check Error:', response.statusText);
            return NextResponse.json({ error: 'Failed to verify payment' }, { status: 502 });
        }

        const paymentData = await response.json();

        // 4. Check Status
        if (paymentData.status === 'succeeded') {
            const planId = paymentData.metadata.plan_id;
            const userId = paymentData.metadata.user_id;

            // Double check user match
            if (userId !== session.user.id) {
                return NextResponse.json({ error: 'User mismatch' }, { status: 403 });
            }

            // Calculate End Date
            const now = new Date();
            const endDate = new Date(now);

            // FAST Tariffs
            if (planId === '1d') endDate.setDate(now.getDate() + 1);
            else if (planId === '3d') endDate.setDate(now.getDate() + 3);
            // PRO Tariffs
            else if (planId === '1m') endDate.setMonth(now.getMonth() + 1);
            else if (planId === '3m') endDate.setMonth(now.getMonth() + 3);
            else if (planId === '6m') endDate.setMonth(now.getMonth() + 6);
            else if (planId === '1y') endDate.setFullYear(now.getFullYear() + 1);

            // Update Database
            const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .update({
                    is_premium: true,
                    subscription_end_date: endDate.toISOString(),
                    subscription_plan_id: planId,
                    subscription_status: 'active'
                })
                .eq('id', userId);

            if (updateError) {
                console.error('DB Update Error:', updateError);
                return NextResponse.json({ error: 'DB Update Failed' }, { status: 500 });
            }

            return NextResponse.json({ success: true, plan: planId });
        } else if (paymentData.status === 'pending') {
            return NextResponse.json({ success: false, status: 'pending' });
        } else {
            return NextResponse.json({ success: false, status: paymentData.status });
        }

    } catch (error) {
        console.error('Payment Check Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
