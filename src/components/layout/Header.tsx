"use client";

import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { useTheme } from '@/context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

interface HeaderProps {
    onProfileClick?: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
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

                    <p className="hide-on-mobile" style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.75rem', marginTop: '0.2rem', fontWeight: 500 }}>
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
                    style={{ fontSize: '0.875rem', padding: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    title="Sign Out"
                >
                    <span className="hide-on-mobile">Sign Out</span>
                    <span className="hide-on-desktop">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    </span>
                </Button>

                <div
                    onClick={onProfileClick}
                    style={{
                        minWidth: '40px', // Prevent shrinking
                        height: '40px',
                        borderRadius: '50%',
                        background: 'hsl(var(--color-surface))',
                        border: '1px solid hsl(var(--color-border))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow-sm)',
                        cursor: onProfileClick ? 'pointer' : 'default'
                    }}
                >
                    {user?.image ? (
                        <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        <span style={{ fontWeight: 600, color: 'hsl(var(--color-primary))' }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </span>
                    )}
                </div>
            </div>
        </header >
    );
}
