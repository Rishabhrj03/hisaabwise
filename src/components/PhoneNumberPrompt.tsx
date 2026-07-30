'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';

/**
 * PhoneNumberPrompt — Prompts new users to add their phone number.
 *
 * Renders nothing if the user already has a phone stored or dismissed the prompt.
 * Uses our own /api/user/phone endpoint instead of any DB SDK directly.
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

  if (!user || isSavedLocally) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/user/phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, phone }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(`Failed to save phone: ${data.error ?? 'Unknown error'}`);
        return;
      }

      window.localStorage.setItem('expense_tracker_phone_saved', 'true');
      setIsSavedLocally(true);
    } catch (err) {
      console.error('[PhoneNumberPrompt] Error:', err);
      alert('Something went wrong. Please try again.');
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
          Add your phone number to sync invites from friends.
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
            {loading ? 'Saving…' : 'Save Phone Number'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
