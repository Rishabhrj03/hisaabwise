"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';

export function Header() {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header style={{
            padding: '1.5rem 0',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div>
                <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Dashboard</h1>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                    Track your expenses effortlessly
                </p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Button
                    variant="secondary"
                    onClick={handleLogout}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                    Sign Out
                </Button>

                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, hsl(var(--color-primary)), hsl(var(--hue-primary) 80% 70%))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 10px var(--color-primary-glow)'
                }}>
                    ME
                </div>
            </div>
        </header>
    );
}
