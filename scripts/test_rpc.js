
const { createClient } = require('@supabase/supabase-js');
const path = require('path');
const fs = require('fs');

// Load env
const envPath = path.resolve(__dirname, '../.env.local');
const envConfig = require('dotenv').parse(fs.readFileSync(envPath));

const supabaseUrl = envConfig.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = envConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRpc() {
    console.log("Testing RPC 'manual_map_user_by_phone'...");

    // We try to call it. It requires authentication usually (security definer uses auth.uid()),
    // but if we call it anon, it should either run (and find no user) or error with "function not found".
    // If it errors with "function not found", we know the SQL didn't run.

    try {
        const { data, error } = await supabase.rpc('manual_map_user_by_phone', {
            target_phone: '0000000000'
        });

        if (error) {
            console.error("RPC FAILED:", error.message);
            if (error.message.includes('function') && error.message.includes('does not exist')) {
                console.log("DIAGNOSIS: The function is MISSING from the database.");
            } else {
                console.log("DIAGNOSIS: The function exists but failed with:", error.message);
            }
        } else {
            console.log("RPC SUCCEEDED (Function exists and ran without error)");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

testRpc();
