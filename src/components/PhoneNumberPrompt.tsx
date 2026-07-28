'use client';

import React, { useState } from 'react';
import { authService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

/**
 * PhoneNumberPrompt — Prompts new users to enter a phone number so they can
 * be linked to friend invitations.
 *
 * Renders nothing if the user already has a phone number on their account,
 * or if the prompt has been dismissed this session.
 */
export function PhoneNumberPrompt() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSavedLocally, setIsSavedLocally] = useState(() => {
    if (typeof window !== 'undefined') {
      return Boolean(window.localStorage.getItem('expense_tracker_phone_saved'));
    }
    return false;
  });

  const hasPhone = user?.phone || user?.user_metadata?.phone;

  if (!user || hasPhone || isSavedLocally) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update auth user metadata (best-effort — non-fatal if it fails).
      await authService.updateUserMetadata({ phone });

      // Run the server-side RPC to link the phone number to any pending friend invitations.
      await authService.callRpc('manual_map_user_by_phone', { target_phone: phone });

      window.localStorage.setItem('expense_tracker_phone_saved', 'true');
      setIsSavedLocally(true);
      window.location.reload();
    } catch (error: unknown) {
      const err = error as { message?: string };
      console.error('[PhoneNumberPrompt] Error updating phone:', error);
      alert(
        `Failed to save phone number.\n\n${err.message ?? String(error)}\n\nHint: Did you run 'supabase_schema_map_phone.sql'?`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.8)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
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
