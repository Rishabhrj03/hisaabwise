import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    style,
    ...props
}: ButtonProps) {

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'hsl(var(--color-primary))',
                    color: '#fff',
                    boxShadow: '0 4px 14px 0 var(--color-primary-glow)',
                };
            case 'secondary':
                return {
                    background: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text-main))',
                    border: '1px solid hsl(var(--color-border))',
                };
            case 'danger':
                return {
                    background: 'hsl(var(--color-expense))',
                    color: '#fff',
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: 'hsl(var(--color-text-muted))',
                };
            default:
                return {};
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm': return { padding: '0.5rem 1rem', fontSize: '0.875rem' };
            case 'lg': return { padding: '1rem 2rem', fontSize: '1.125rem' };
            default: return { padding: '0.75rem 1.5rem', fontSize: '1rem' };
        }
    };

    return (
        <button
            className={`btn ${className}`}
            style={{
                border: 'none',
                borderRadius: 'var(--radius-md)',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'transform 0.1s ease, opacity 0.2s ease',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                ...getVariantStyles(),
                ...getSizeStyles(),
                ...style,
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
                e.currentTarget.style.transform = 'translateY(0)';
            }}
            onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(1px)'}
            onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            {...props}
        >
            {children}
        </button>
    );
}
