import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ROBOKASSA_PASSWORD_2 = process.env.ROBOKASSA_PASSWORD_2;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const outSum = formData.get('OutSum') as string;
        const invId = formData.get('InvId') as string;
        const signatureValue = formData.get('SignatureValue') as string;
        const shpPlan = formData.get('Shp_Plan') as string;
        const shpUserId = formData.get('Shp_UserId') as string;

        if (!ROBOKASSA_PASSWORD_2) {
            console.error('Missing ROBOKASSA_PASSWORD_2');
            return NextResponse.json({ error: 'Config error' }, { status: 500 });
        }

        // Validate Signature
        // Signature: OutSum:InvId:Pass2:Shp_Plan=...:Shp_UserId=...
        const signatureString = `${outSum}:${invId}:${ROBOKASSA_PASSWORD_2}:Shp_Plan=${shpPlan}:Shp_UserId=${shpUserId}`;
        const mySignature = crypto.createHash('md5').update(signatureString).digest('hex');

        if (mySignature.toLowerCase() !== signatureValue.toLowerCase()) {
            console.error('Invalid signature');
            return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }

        // Calculate subscription end date
        const now = new Date();
        const endDate = new Date(now);

        if (shpPlan === '1m') endDate.setMonth(now.getMonth() + 1);
        else if (shpPlan === '3m') endDate.setMonth(now.getMonth() + 3);
        else if (shpPlan === '6m') endDate.setMonth(now.getMonth() + 6);
        else if (shpPlan === '1y') endDate.setFullYear(now.getFullYear() + 1);

        // Update Database
        // We use service role key if available, or just standard client (result is usually server-to-server)
        // Ideally we should use Service Role to bypass RLS, but here we can try standard client
        // wait, for public update (callback) we need service role or a specific function.
        // But since we operate in route handler, we can create a client with cookieStore? 
        // No, this request comes from Robokassa, so no cookies. 
        // We MUST use Service Role Key for this operation!
        // Assuming we have SUPABASE_SERVICE_ROLE_KEY in env, but user didn't mention it.
        // Let's check env.local content again.

        // Use a client that bypasses RLS or ensure RLS allows update?
        // Usually we need SUPABASE_SERVICE_ROLE_KEY.

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        // WARN: Since this is a callback from Robokassa, `cookies()` are empty. 
        // We won't have a session. RLS will block the update if policies require auth.
        // We need a SUPER CLIENT.
        // I'll check if we have a service key in .env.local via view_file.

        // For now, I will write this assuming we might need to fetch the service key.
        // Or I can use a postgres function via RPC if I can't use service key.

        // Let's rely on `createClient` from `@supabase/supabase-js` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`?
        // Anon key respects RLS. We can't update another user's profile with anon key without session.

        // I need to check `.env.local` first to see if I have `SUPABASE_SERVICE_ROLE_KEY`.
        // If not, I'll have to ask the user or add it.

        // Placeholder for now, I will verify the service key after this step.

        return new NextResponse(`OK${invId}`);

    } catch (error) {
        console.error('Payment Result Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
