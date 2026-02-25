import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const PAYANYWAY_MNT_ID = process.env.PAYANYWAY_MNT_ID?.trim();
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const NEXT_PUBLIC_SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

export async function POST(request: Request) {
    try {
        // PayAnyWay вебхуки приходят в виде x-www-form-urlencoded
        const formData = await request.formData();

        const MNT_ID = formData.get('MNT_ID') as string;
        const MNT_TRANSACTION_ID = formData.get('MNT_TRANSACTION_ID') as string;
        const MNT_OPERATION_ID = formData.get('MNT_OPERATION_ID') as string;
        const MNT_AMOUNT = formData.get('MNT_AMOUNT') as string;

        console.log('PayAnyWay Webhook received:', { MNT_ID, MNT_TRANSACTION_ID, MNT_OPERATION_ID, MNT_AMOUNT });

        // 1. Проверяем что запрос пришёл для нашего магазина (вместо подписи, т.к. для самозанятых она не поддерживается)
        if (MNT_ID !== PAYANYWAY_MNT_ID) {
            console.error('PayAnyWay Invalid MNT_ID!', { received: MNT_ID, expected: PAYANYWAY_MNT_ID });
            return new NextResponse('FAIL', { status: 400 });
        }

        // 2. Инициализируем Admin Client
        const supabaseAdmin = createClient(
            NEXT_PUBLIC_SUPABASE_URL!,
            SUPABASE_SERVICE_ROLE_KEY!,
            {
                auth: { autoRefreshToken: false, persistSession: false }
            }
        );

        // 3. Получаем данные о заказе из БД (чтобы не зависеть от кастомных полей PayAnyWay)
        const { data: paymentInfo, error: fetchError } = await supabaseAdmin
            .from('payments')
            .select('plan_id, user_id')
            .eq('id', MNT_TRANSACTION_ID)
            .single();

        if (fetchError || !paymentInfo) {
            console.error('PayAnyWay Webhook Payment Not Found:', fetchError);
            return new NextResponse('FAIL', { status: 404 });
        }

        const plan = paymentInfo.plan_id;
        const userId = paymentInfo.user_id;

        // 4. Обновляем статус заказа в таблице payments
        await supabaseAdmin
            .from('payments')
            .update({ status: 'paid', provider_payment_id: MNT_OPERATION_ID })
            .eq('id', MNT_TRANSACTION_ID);

        // 5. Вычисляем дату окончания подписки
        const now = new Date();
        const endDate = new Date(now);

        // FAST Tariffs
        if (plan === '1d') endDate.setDate(now.getDate() + 1);
        else if (plan === '3d') endDate.setDate(now.getDate() + 3);
        // PRO Tariffs
        else if (plan === '1m') endDate.setMonth(now.getMonth() + 1);
        else if (plan === '3m') endDate.setMonth(now.getMonth() + 3);
        else if (plan === '6m') endDate.setMonth(now.getMonth() + 6);
        else if (plan === '1y') endDate.setFullYear(now.getFullYear() + 1);

        // 5. Обновляем профиль пользователя, выдаем доступ
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
            return new NextResponse('FAIL', { status: 500 });
        }

        // 6. Возвращаем SUCCESS (это требование PayAnyWay API, чтобы они поняли, что мы всё обработали)
        return new NextResponse('SUCCESS', { status: 200 });

    } catch (error) {
        console.error('PayAnyWay Webhook General Error:', error);
        return new NextResponse('FAIL', { status: 500 });
    }
}
