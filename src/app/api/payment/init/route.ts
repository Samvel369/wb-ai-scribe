import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const YOOKASSA_SHOP_ID = process.env.DTO_YOOKASSA_SHOP_ID?.trim();
const YOOKASSA_SECRET_KEY = process.env.DTO_YOOKASSA_SECRET_KEY?.trim();

console.log("------------------------------------------------------------------");
console.log("PAYMENT INIT DEBUG:");
console.log("SHOP_ID:", YOOKASSA_SHOP_ID ? "LOADED" : "MISSING", YOOKASSA_SHOP_ID);
console.log("SECRET_KEY:", YOOKASSA_SECRET_KEY ? "LOADED" : "MISSING", YOOKASSA_SECRET_KEY ? "******" + YOOKASSA_SECRET_KEY.slice(-4) : "");
console.log("------------------------------------------------------------------");

const TARIFFS: Record<string, number> = {
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
        const idempotenceKey = crypto.randomUUID();

        // Create Payment in YooKassa
        const auth = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64');

        const response = await fetch('https://api.yookassa.ru/v3/payments', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${auth}`,
                'Idempotence-Key': idempotenceKey
            },
            body: JSON.stringify({
                amount: {
                    value: amount,
                    currency: 'RUB'
                },
                capture: true,
                confirmation: {
                    type: 'redirect',
                    return_url: `${request.headers.get('origin')}/app?payment_check=true`
                },
                description: `Подписка AI Seller Pro (${plan})`,
                metadata: {
                    user_id: userId,
                    plan_id: plan
                }
            })
        });

        const paymentData = await response.json();

        if (!response.ok) {
            console.error('YooKassa Error:', paymentData);
            // Возвращаем детали ошибки на фронтенд для отладки
            return NextResponse.json({
                error: 'Payment provider error',
                details: paymentData
            }, { status: 500 });
        }

        return NextResponse.json({
            url: paymentData.confirmation.confirmation_url,
            payment_id: paymentData.id
        });

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
