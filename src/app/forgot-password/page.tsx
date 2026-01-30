'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage('Email sent! Please check your inbox.');
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
            padding: '1rem'
        }}>
            <div className="glass-panel" style={{
                width: '100%',
                maxWidth: '480px',
                padding: '3rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Forgot Password</h1>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                        Enter your email to receive a reset link.
                    </p>
                </div>

                {message && (
                    <div style={{
                        padding: '1rem',
                        background: 'hsl(var(--hue-success) 90% 85%)',
                        color: 'hsl(var(--hue-success) 40% 30%)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        fontSize: '0.875rem'
                    }}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={{
                        padding: '1rem',
                        background: 'hsl(var(--hue-danger) 95% 90%)',
                        color: 'hsl(var(--hue-danger) 40% 40%)',
                        borderRadius: 'var(--radius-sm)',
                        textAlign: 'center',
                        fontSize: '0.875rem'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                borderRadius: 'var(--radius-sm)',
                                border: '1px solid var(--color-border)',
                                background: 'rgba(255, 255, 255, 0.05)',
                                color: 'hsl(var(--color-text-main))',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    <Button type="submit" disabled={loading} size="lg" style={{ width: '100%' }}>
                        {loading ? 'Sending...' : 'Send Reset Link'}
                    </Button>
                </form>

                <div style={{ textAlign: 'center' }}>
                    <a href="/login" style={{ fontSize: '0.875rem', color: 'hsl(var(--color-text-muted))', textDecoration: 'none' }}>
                        ← Back to Login
                    </a>
                </div>
            </div>
        </div>
    );
}
