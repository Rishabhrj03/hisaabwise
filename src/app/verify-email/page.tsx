'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams?.get('token');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        if (!token) {
            setStatus('error');
            setMessage('No verification token provided.');
            return;
        }

        const verify = async () => {
            try {
                const res = await fetch('/api/auth/verify-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();

                if (res.ok) {
                    setStatus('success');
                    setMessage('Email verified successfully!');
                } else {
                    setStatus('error');
                    setMessage(data.error || 'Verification failed');
                }
            } catch (error) {
                setStatus('error');
                setMessage('Something went wrong.');
            }
        };

        verify();
    }, [token]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <Card style={{ padding: '2rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
                <h1 style={{ marginBottom: '1rem' }}>Email Verification</h1>

                {status === 'verifying' && <p>Verifying your email...</p>}

                {status === 'success' && (
                    <div>
                        <p style={{ color: 'green', marginBottom: '1rem' }}>{message}</p>
                        <Button onClick={() => router.push('/')}>Go to Dashboard</Button>
                    </div>
                )}

                {status === 'error' && (
                    <div>
                        <p style={{ color: 'red', marginBottom: '1rem' }}>{message}</p>
                        <Button variant="secondary" onClick={() => router.push('/login')}>Go to Login</Button>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
