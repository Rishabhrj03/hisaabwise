'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

type Mode = 'login' | 'register';

/**
 * LoginPage — Custom sign-in / sign-up form using NextAuth credentials.
 *
 * No third-party auth UI library dependency. Tabs toggle between Login and Register.
 */
export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        // 1. Create the account via our register API.
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Registration failed. Please try again.');
          return;
        }
      }

      // 2. Sign in with NextAuth credentials (covers both login and post-register).
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password.');
        return;
      }

      router.replace('/');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'hsl(var(--color-background))',
        padding: '1rem',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '480px',
          background: 'hsl(var(--color-surface))',
          borderRadius: 'var(--radius-lg)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          padding: '2rem',
          border: '1px solid hsl(var(--color-border))',
        }}
      >
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            marginBottom: '1.5rem',
            textAlign: 'center',
            color: 'hsl(var(--color-text-main))',
          }}
        >
          Expense Tracker
        </h1>

        {/* Mode Toggle */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
          {(['login', 'register'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(''); }}
              style={{
                flex: 1,
                padding: '0.625rem',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.875rem',
                background:
                  mode === m
                    ? 'hsl(var(--color-primary))'
                    : 'hsl(var(--color-background))',
                color:
                  mode === m
                    ? '#fff'
                    : 'hsl(var(--color-text-muted))',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {m === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'register' && (
            <Input
              label="Full Name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            label="Password"
            type="password"
            placeholder={mode === 'register' ? 'Minimum 8 characters' : 'Your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
          />

          {error && (
            <p style={{ color: 'hsl(var(--color-expense))', fontSize: '0.875rem', textAlign: 'center' }}>
              {error}
            </p>
          )}

          <Button type="submit" style={{ marginTop: '0.5rem' }} disabled={loading}>
            {loading
              ? mode === 'register' ? 'Creating account…' : 'Signing in…'
              : mode === 'register' ? 'Create Account' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
