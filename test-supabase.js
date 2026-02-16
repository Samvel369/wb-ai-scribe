require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing connection to:', supabaseUrl);
console.log('Key:', supabaseKey);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    try {
        console.log('--- Testing Database (Public) ---');
        const { data: dbData, error: dbError } = await supabase.from('generations').select('count', { count: 'exact', head: true });
        if (dbError) console.error('DB Error:', dbError.message);
        else console.log('DB Connection: OK');

        console.log('--- Testing Auth API ---');
        // Try to get a session. Even if none exists, it should not throw an error if the key is valid.
        const { data: authData, error: authError } = await supabase.auth.getSession();

        if (authError) {
            console.error('Auth API Check FAILED:', authError.message);
            console.log('CRITICAL: This confirm the API Key is invalid for Authentication.');
        } else {
            console.log('Auth API Check SUCCESSFUL!');
        }

    } catch (err) {
        console.error('Unexpected error:', err.message);
    }
}

testConnection();
