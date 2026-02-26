import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const PAYANYWAY_MNT_ID = process.env.PAYANYWAY_MNT_ID?.trim();
const PAYANYWAY_MNT_DATAINTEGRITY_CODE = process.env.PAYANYWAY_MNT_DATAINTEGRITY_CODE?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

const PLAN_NAMES: Record<string, string> = {
    '1d': 'Подписка AI Seller Pro FAST (1 день)',
    '3d': 'Подписка AI Seller Pro FAST (3 дня)',
    '1m': 'Подписка AI Seller Pro PRO (1 месяц)',
    '3m': 'Подписка AI Seller Pro PRO (3 месяца)',
    '6m': 'Подписка AI Seller Pro PRO (6 месяцев)',
    '1y': 'Подписка AI Seller Pro PRO (1 год)',
};

async function handleRequest(request: Request) {
    try {
        let MNT_ID = '';
        let MNT_TRANSACTION_ID = '';
        let MNT_OPERATION_ID = '';
        let MNT_AMOUNT = '';

        if (request.method === 'POST') {
            try {
                const formData = await request.formData();
                MNT_ID = formData.get('MNT_ID') as string;
                MNT_TRANSACTION_ID = formData.get('MNT_TRANSACTION_ID') as string;
                MNT_OPERATION_ID = formData.get('MNT_OPERATION_ID') as string;
                MNT_AMOUNT = formData.get('MNT_AMOUNT') as string;
            } catch (e) {
                console.error('PayAnyWay Webhook Form Data Error:', e);
                return new NextResponse('FAIL#1_FORM_DATA_ERROR', { status: 400 });
            }
        } else if (request.method === 'GET') {
            const { searchParams } = new URL(request.url);
            MNT_ID = searchParams.get('MNT_ID') || '';
            MNT_TRANSACTION_ID = searchParams.get('MNT_TRANSACTION_ID') || '';
            MNT_OPERATION_ID = searchParams.get('MNT_OPERATION_ID') || '';
            MNT_AMOUNT = searchParams.get('MNT_AMOUNT') || '';
        }

        console.log('PayAnyWay Webhook received (Method: ' + request.method + '):', { MNT_ID, MNT_TRANSACTION_ID, MNT_OPERATION_ID, MNT_AMOUNT });

        // 1. Проверяем что запрос пришёл для нашего магазина
        if (MNT_ID !== PAYANYWAY_MNT_ID) {
            console.error('PayAnyWay Invalid MNT_ID!', { received: MNT_ID, expected: PAYANYWAY_MNT_ID });
            return new NextResponse('FAIL#2_INVALID_MNT_ID', { status: 400 });
        }

        // 2. Инициализируем Admin Client
        const supabaseAdmin = createClient(
            NEXT_PUBLIC_SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        );

        // 3. Получаем данные о заказе из БД
        const { data: paymentInfo, error: fetchError } = await supabaseAdmin
            .from('payments')
            .select('plan_id, user_id, amount')
            .eq('id', MNT_TRANSACTION_ID)
            .single();

        if (fetchError || !paymentInfo) {
            console.error('PayAnyWay Webhook Payment Not Found:', fetchError);
            return new NextResponse('FAIL#3_PAYMENT_NOT_FOUND', { status: 404 });
        }

        const plan = paymentInfo.plan_id;
        const userId = paymentInfo.user_id;
        const amount = paymentInfo.amount;

        // 4. Обновляем статус заказа в таблице payments
        await supabaseAdmin
            .from('payments')
            .update({ status: 'paid', provider_payment_id: MNT_OPERATION_ID })
            .eq('id', MNT_TRANSACTION_ID);

        // 5. Вычисляем дату окончания подписки
        const now = new Date();
        const endDate = new Date(now);

        if (plan === '1d') endDate.setDate(now.getDate() + 1);
        else if (plan === '3d') endDate.setDate(now.getDate() + 3);
        else if (plan === '1m') endDate.setMonth(now.getMonth() + 1);
        else if (plan === '3m') endDate.setMonth(now.getMonth() + 3);
        else if (plan === '6m') endDate.setMonth(now.getMonth() + 6);
        else if (plan === '1y') endDate.setFullYear(now.getFullYear() + 1);

        // 6. Обновляем профиль пользователя
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .update({
                is_premium: true,
                subscription_end_date: endDate.toISOString(),
                subscription_plan_id: plan,
                subscription_status: 'active'
            })
            .eq('id', userId);

        if (profileError) {
            console.error('PayAnyWay Webhook Profile Update Error:', profileError);
            return new NextResponse('FAIL#4_PROFILE_UPDATE_ERROR', { status: 500 });
        }

        console.log('PayAnyWay Webhook SUCCESS! User:', userId, 'Plan:', plan);

        // 7. Формируем подпись для XML-ответа (обязательно, если настроен Код проверки целостности)
        const resultCode = '200';
        let signatureXml = '';
        if (PAYANYWAY_MNT_DATAINTEGRITY_CODE) {
            // MD5(MNT_RESULT_CODE + MNT_ID + MNT_TRANSACTION_ID + КодПЦД)
            const strForHash = resultCode + MNT_ID + MNT_TRANSACTION_ID + PAYANYWAY_MNT_DATAINTEGRITY_CODE;
            const signature = crypto.createHash('md5').update(strForHash).digest('hex').toLowerCase();
            signatureXml = `<MNT_SIGNATURE>${signature}</MNT_SIGNATURE>`;
        }

        // Для чека самозанятого: получаем email пользователя из профиля или Auth
        const { data: userAuth, error: authErr } = await supabaseAdmin.auth.admin.getUserById(userId);
        const userEmail = userAuth?.user?.email;

        // Если email нет в БД — мы физически не можем пробить чек по 54-ФЗ
        if (!userEmail) {
            console.error(`PayAnyWay Webhook Error: Cannot generate receipt. Missing email for user ${userId}`);
            return new NextResponse('FAIL#6_MISSING_EMAIL_FOR_RECEIPT', { status: 400 });
        }

        // 8. Формируем обязательный JSON INVENTORY (Номенклатура для кассы)
        const itemName = PLAN_NAMES[plan] || 'Подписка AI Seller Pro';
        const itemPrice = Number(amount).toFixed(2);

        const inventory = JSON.stringify({
            customer: userEmail,
            items: [
                {
                    name: itemName,
                    price: parseFloat(itemPrice),
                    quantity: 1,
                    amount: parseFloat(itemPrice),
                    vat: "none",
                    paymentMethod: "full_prepayment",
                    paymentObject: "service"
                }
            ]
        });

        // Возвращаем правильный XML с номенклатурой
        const xmlResponse = `<?xml version="1.0" encoding="UTF-8"?>
<MNT_RESPONSE>
<MNT_ID>${MNT_ID}</MNT_ID>
<MNT_TRANSACTION_ID>${MNT_TRANSACTION_ID}</MNT_TRANSACTION_ID>
<MNT_RESULT_CODE>${resultCode}</MNT_RESULT_CODE>
${signatureXml}
<MNT_DESCRIPTION>${itemName}</MNT_DESCRIPTION>
<MNT_ATTRIBUTES>
<ATTRIBUTE><KEY>INVENTORY</KEY><VALUE><![CDATA[${inventory}]]></VALUE></ATTRIBUTE>
</MNT_ATTRIBUTES>
</MNT_RESPONSE>`;

        return new NextResponse(xmlResponse, {
            status: 200,
            headers: { 'Content-Type': 'application/xml; charset=utf-8' }
        });

    } catch (error) {
        console.error('PayAnyWay Webhook General Error:', error);
        return new NextResponse('FAIL#5_GENERAL_ERROR', { status: 500 });
    }
}

export async function POST(request: Request) {
    return handleRequest(request);
}

export async function GET(request: Request) {
    return handleRequest(request);
}
