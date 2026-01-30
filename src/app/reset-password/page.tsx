'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/Button';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (!token) {
            setError('Invalid token');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Something went wrong');
            }

            setMessage('Password reset successful! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!token) {
        return (
            <div style={{ textAlign: 'center', color: 'hsl(var(--hue-danger) 40% 40%)' }}>
                Invalid or missing token.
            </div>
        );
    }

    return (
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
                <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>Reset Password</h1>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                    Enter your new password below.
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
                        New Password
                    </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        placeholder="••••••••"
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

                <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                        Confirm Password
                    </label>
                    <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="••••••••"
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
                    {loading ? 'Resettin...' : 'Reset Password'}
                </Button>
            </form>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
            padding: '1rem'
        }}>
            <Suspense fallback={<div>Loading...</div>}>
                <ResetPasswordForm />
            </Suspense>
        </div>
    );
}
