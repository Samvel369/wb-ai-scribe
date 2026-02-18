import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ROBOKASSA_LOGIN = process.env.ROBOKASSA_LOGIN;
const ROBOKASSA_PASSWORD_1 = process.env.ROBOKASSA_PASSWORD_1;
const ROBOKASSA_IS_TEST = process.env.ROBOKASSA_IS_TEST;

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
        const outSum = TARIFFS[plan].toString();
        const invId = '0'; // Using 0 as we track via Shp_UserId
        const isTest = ROBOKASSA_IS_TEST === '1';

        // Custom parameters (Must be sorted alphabetically for signature!)
        // Shp_Plan
        // Shp_UserId

        // Signature: Login:OutSum:InvId:Pass1:Shp_Plan=...:Shp_UserId=...
        const signatureString = `${ROBOKASSA_LOGIN}:${outSum}:${invId}:${ROBOKASSA_PASSWORD_1}:Shp_Plan=${plan}:Shp_UserId=${userId}`;
        const signature = crypto.createHash('md5').update(signatureString).digest('hex');

        let url = `https://auth.robokassa.ru/Merchant/Index.aspx?`;
        url += `MerchantLogin=${ROBOKASSA_LOGIN}`;
        url += `&OutSum=${outSum}`;
        url += `&InvId=${invId}`;
        url += `&Description=${encodeURIComponent(`Подписка AI Seller на ${plan}`)}`;
        url += `&SignatureValue=${signature}`;
        url += `&Shp_Plan=${plan}`;
        url += `&Shp_UserId=${userId}`;

        if (isTest) {
            url += `&IsTest=1`;
        }

        return NextResponse.json({ url });

    } catch (error) {
        console.error('Payment Init Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
