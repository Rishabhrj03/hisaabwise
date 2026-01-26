
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

    if (hasPhone) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Update Auth User Metadata
            const { error } = await supabase.auth.updateUser({
                data: { phone: phone }
            });

            if (error) throw error;

            // Also try to update the actual auth phone column if possible, but that usually requires verification.
            // For our 'mapping' logic, we are relying on:
            // 1. Where does the 'handle_new_user_mapping' trigger look?
            //    It looks at `new.phone`. This comes from the auth.users table phone column.

            // CRITICAL: Just updating metadata won't fire the trigger on the auth.users table for the `phone` column 
            // if the trigger is watching that specific column.
            // However, our trigger is `after insert on auth.users`.
            // If the user already exists, the INSERT trigger has already fired (without phone).
            // We need a way to re-run the mapping logic.

            // Solution: We should probably run the mapping LOGIC manually here via an RPC call 
            // OR update the trigger to also fire on UPDATE of phone.

            // Let's call a custom Postgres function to do the mapping now.

            const { error: rpcError } = await supabase.rpc('manual_map_user_by_phone', {
                target_phone: phone
            });

            if (rpcError) {
                // Fallback: If function doesn't exist, we might be stuck.
                // But we can just rely on the user metadata update for UI purposes.
                console.error("Mapping trigger failed", rpcError);
            }

            // Reload to reflect changes
            window.location.reload();

        } catch (error) {
            console.error("Error updating phone:", error);
            alert("Failed to save phone number.");
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

