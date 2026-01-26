
"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

export function PhoneNumberPrompt() {
    const { user } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    // We can also check if we've already asked / dismissed this session to be less annoying
    // For now, let's just check if phone exists in user metadata.
    // Note: This relies on where phone is stored. 
    // If using Supabase Auth phone, it's user.phone
    // If custom profile, it's in a profiles table.

    const hasPhone = user?.phone || user?.user_metadata?.phone;

    // Local Storage Check for "Soft" persistence if Auth update fails
    const [isSavedLocally, setIsSavedLocally] = useState(false);

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = window.localStorage.getItem('expense_tracker_phone_saved');
            if (saved) setIsSavedLocally(true);
        }
    }, []);



    if (!user || hasPhone || isSavedLocally) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // 1. Update Auth User Metadata (Optional - Best Effort)
            const { error: updateError } = await supabase.auth.updateUser({
                data: { phone: phone }
            });

            if (updateError) {
                console.warn("Auth update warning (continuing...):", updateError);
                // We don't throw here. We proceed to map the user anyway.
            }

            // 2. Run Mapping Logic (RPC)
            // This allows us to link previously invited friends to this new user
            const { error: rpcError } = await supabase.rpc('manual_map_user_by_phone', {
                target_phone: phone
            });

            if (rpcError) {
                console.error("RPC Error:", rpcError);
                alert(`RPC Function Error: ${rpcError.message} \n\nHint: Did you run 'supabase_schema_map_phone.sql'?`);
                throw new Error(`Database Error: ${rpcError.message}`);
            }

            // RELOAD Logic
            if (typeof window !== 'undefined') {
                window.localStorage.setItem('expense_tracker_phone_saved', 'true');
            }

            // Reload to reflect changes
            window.location.reload();

        } catch (error: any) {
            console.error("Error updating phone:", error);
            // Debugging: Show full error details
            alert(`Debug Error: ${JSON.stringify(error, null, 2)} \n\nMessage: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <Card variant="default" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 style={{ marginBottom: '1rem' }}>Complete Your Profile</h3>
                <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--color-text-muted))' }}>
                    Please add your phone number to sync invites from friends.
                </p>
                <form onSubmit={handleSubmit}>
                    <Input
                        placeholder="Phone (e.g. 919876543210)"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        type="tel"
                        style={{ marginBottom: '1rem' }}
                    />
                    <Button type="submit" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Saving...' : 'Save Phone Number'}
                    </Button>
                </form>
            </Card>
        </div>
    );
}

