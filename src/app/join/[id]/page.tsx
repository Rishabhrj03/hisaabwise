'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useSWRConfig } from 'swr';

export default function JoinGroupPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const [group, setGroup] = useState<{ name: string } | null>(null);
    const [error, setError] = useState('');
    const [joining, setJoining] = useState(false);
    const { mutate } = useSWRConfig();

    // Unwrap params
    const resolvedParams = use(params);
    const groupId = resolvedParams.id;

    useEffect(() => {
        const fetchGroup = async () => {
            try {
                const res = await fetch(`/api/groups/${groupId}`);
                if (res.ok) {
                    const data = await res.json();
                    setGroup(data);
                } else {
                    setError('Group not found');
                }
            } catch (err) {
                setError('Failed to load group info');
            }
        };

        if (groupId) fetchGroup();
    }, [groupId]);

    const handleJoin = async () => {
        setJoining(true);
        try {
            const res = await fetch(`/api/groups/${groupId}/join`, {
                method: 'POST',
            });

            if (res.ok) {
                // Force revalidation of groups list
                await mutate('/api/groups');
                router.push('/');
            } else {
                const data = await res.json();
                setError(data.message || 'Failed to join group');
            }
        } catch (err) {
            setError('Something went wrong');
        } finally {
            setJoining(false);
        }
    };

    if (authLoading) return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
        }}>
            <div className="text-muted-foreground animate-pulse">Loading...</div>
        </div>
    );

    // Common container style for consistency
    const containerStyle = {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, hsl(var(--color-background)) 0%, hsl(var(--hue-primary) 30% 95%) 100%)',
        padding: '1rem'
    };

    const cardStyle = {
        width: '100%',
        maxWidth: '480px',
        padding: '3rem',
        borderRadius: 'var(--radius-lg)',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column' as const,
        gap: '2rem',
        textAlign: 'center' as const,
        background: 'rgba(255, 255, 255, 0.7)', // Fallback
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        border: '1px solid rgba(255, 255, 255, 0.5)'
    };

    if (!user) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle} className="glass-panel">
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto',
                        background: 'hsl(var(--color-primary) / 0.1)',
                        color: 'hsl(var(--color-primary))',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 8px 16px -4px hsl(var(--color-primary) / 0.2)'
                    }}>
                        🔐
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '0.75rem', fontWeight: 700 }}>Login Required</h1>
                        <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1.1rem', lineHeight: 1.5 }}>
                            You need to be logged in to join this group.
                        </p>
                    </div>
                    <Button
                        onClick={() => router.push(`/login?redirect=/join/${groupId}`)}
                        size="lg"
                        style={{ width: '100%', padding: '1rem' }}
                    >
                        Log In to Continue
                    </Button>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div style={containerStyle}>
                <div style={cardStyle} className="glass-panel">
                    <div style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto',
                        background: 'hsl(var(--hue-danger) 95% 90%)',
                        color: 'hsl(var(--color-danger))',
                        borderRadius: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem'
                    }}>
                        ⚠️
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', fontWeight: 600 }}>Oops!</h1>
                        <p style={{ color: 'hsl(var(--color-danger))', fontSize: '1.1rem' }}>{error}</p>
                    </div>
                    <Button
                        variant="secondary"
                        onClick={() => router.push('/')}
                        size="lg"
                        style={{ width: '100%' }}
                    >
                        Go to Dashboard
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={cardStyle} className="glass-panel">
                <div style={{
                    width: '100px',
                    height: '100px',
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--hue-primary) 60% 60%) 100%)',
                    color: 'white',
                    borderRadius: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '3rem',
                    boxShadow: '0 12px 24px -6px hsl(var(--color-primary) / 0.4)',
                    marginBottom: '1rem'
                }}>
                    👥
                </div>

                <div>
                    <span style={{
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'hsl(var(--color-primary))',
                        background: 'hsl(var(--color-primary) / 0.1)',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px'
                    }}>
                        Group Invitation
                    </span>
                    <h1 style={{ fontSize: '2.5rem', marginTop: '1rem', marginBottom: '0.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        {group?.name || 'Loading...'}
                    </h1>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '1.1rem', lineHeight: 1.5, maxWidth: '80%', margin: '0 auto' }}>
                        You've been invited to join this group to track and split expenses together.
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <Button
                        onClick={handleJoin}
                        disabled={joining || !group}
                        size="lg"
                        style={{
                            width: '100%',
                            padding: '1.1rem',
                            fontSize: '1.1rem',
                            boxShadow: '0 8px 20px -4px hsl(var(--color-primary) / 0.3)'
                        }}
                    >
                        {joining ? 'Joining Group...' : 'Accept Invitation'}
                    </Button>
                    <button
                        onClick={() => router.push('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'hsl(var(--color-text-muted))',
                            fontWeight: 600,
                            cursor: 'pointer',
                            padding: '0.5rem',
                            transition: 'color 0.2s'
                        }}
                    >
                        No thanks, take me home
                    </button>
                </div>
            </div>
        </div>
    );
}
