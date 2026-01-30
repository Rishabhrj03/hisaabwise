/* eslint-disable */
const { createClient } = require('@supabase/supabase-js');

// User provided:
const supabaseUrl = 'https://azwnztuzxfucafepcwkz.supabase.co';
const supabaseKey = 'sb_publishable_Ge7Xq7VaPzW8-MOBZbjoqw_SZxXzPJZ';

console.log("Testing connection with:");
console.log("URL:", supabaseUrl);
console.log("Key:", supabaseKey);

// Check if Key looks like a JWT
if (!supabaseKey.startsWith('ey')) {
    console.warn("\nWARNING: The provided key does NOT start with 'ey'.");
    console.warn("Standard Supabase Anon Keys are JWTs and typically start with 'eyJ...'.");
    console.warn("This might be the wrong key (e.g. from a different service or a different section).\n");
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log('Attempting to fetch session...');

    try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
            console.error('\nAuth Connection Failed!');
            console.error('Error:', error);
        } else {
            console.log('\nAuth Connection Successful!');
            console.log('Session Data:', data);
        }

        console.log('\nAttempting Database Access...');
        // Try to select from expenses (even if empty, just checking connectivity/auth)
        const { data: dbData, error: dbError } = await supabase
            .from('expenses')
            .select('*')
            .limit(1);

        if (dbError) {
            console.error('\nDatabase Connection Failed!');
            console.error('Error Code:', dbError.code);
            console.error('Error Details:', dbError);
            console.error('Hint:', dbError.hint);
            console.error('Message:', dbError.message);
        } else {
            console.log('\nDatabase Connection Successful!');
            console.log('Data:', dbData);
        }

    } catch (err) {
        console.error('\nUnexpected Error:', err);
    }
}

testConnection();
