"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export function Header() {
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <header className="glass-panel" style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 50,
            padding: '1rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 'var(--radius-full)'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img src="/logo.svg" alt="HisaabWise Logo" style={{ width: '42px', height: '42px' }} />
                <div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: '0', lineHeight: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
                        <span className="text-gradient">HISAABWISE</span>
                    </h1>
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 500 }}>
                        Track Expense, Analyze Easily.
                    </p>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <Button
                    variant="ghost"
                    onClick={toggleTheme}
                    style={{ padding: '0.5rem' }}
                    title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                >
                    {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                </Button>

                <Button
                    variant="ghost"
                    onClick={handleLogout}
                    style={{ fontSize: '0.875rem', padding: '0.5rem 1rem' }}
                >
                    Sign Out
                </Button>

                <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'hsl(var(--color-surface))',
                    border: '1px solid hsl(var(--color-border))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    boxShadow: 'var(--shadow-sm)'
                }}>
                    {user?.image ? (
                        <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontWeight: 600, color: 'hsl(var(--color-primary))' }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                    )}
                </div>
            </div>
        </header>
    );
}
