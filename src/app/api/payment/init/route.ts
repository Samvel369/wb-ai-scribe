import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYANYWAY_MNT_ID = process.env.PAYANYWAY_MNT_ID?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const TARIFFS: Record<string, number> = {
    '1d': 79,
    '3d': 149,
    '1m': 990,
    '3m': 2490,
    '6m': 4790,
    '1y': 8990,
};

export async function POST(request: Request) {
    try {
        const { plan } = await request.json();

        if (!plan || !TARIFFS[plan]) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const amount = TARIFFS[plan].toFixed(2);

        // Админский клиент для записи в защищенную таблицу
        const supabaseAdmin = createClient(
            NEXT_PUBLIC_SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        );

        // 1. Создаем заказ в нашей базе данных
        const { data: payment, error: insertError } = await supabaseAdmin
            .from('payments')
            .insert({
                user_id: userId,
                plan_id: plan,
                amount: TARIFFS[plan]
            })
            .select('id')
            .single();

        if (insertError || !payment) {
            console.error('DB Insert Error:', insertError);
            return NextResponse.json({ error: 'Failed to create payment in DB' }, { status: 500 });
        }

        const transactionId = payment.id;
        const currency = 'RUB';
        const description = `Подписка AI Seller Pro (${plan})`;

        // Формируем ссылку на оплату через assistant.moneta.ru
        const payUrl = new URL('https://assistant.moneta.ru/assistant.htm');
        payUrl.searchParams.set('MNT_ID', PAYANYWAY_MNT_ID || '');
        payUrl.searchParams.set('MNT_TRANSACTION_ID', transactionId);
        payUrl.searchParams.set('MNT_CURRENCY_CODE', currency);
        payUrl.searchParams.set('MNT_AMOUNT', amount);
        payUrl.searchParams.set('MNT_DESCRIPTION', description);
        payUrl.searchParams.set('MNT_SUBSCRIBER_ID', session.user.email || userId); // Передаем email (обязательно для чеков самозанятых)

        // Возврат на сайт после успешной оплаты
        const successUrl = `${request.headers.get('origin')}/app?payment_check=true`;
        payUrl.searchParams.set('MNT_SUCCESS_URL', successUrl);

        return NextResponse.json({
            url: payUrl.toString(),
            payment_id: transactionId
        });

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
