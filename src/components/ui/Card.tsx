import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass' | 'elevated' | 'gradient';
    title?: React.ReactNode;
    action?: React.ReactNode;
    defaultOpen?: boolean;
    hover?: boolean;
}

export function Card({
    children,
    className = '',
    variant = 'default',
    title,
    action,
    defaultOpen = true,
    hover = false,
    ...props
}: CardProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);

    const variantStyles: React.CSSProperties = {
        default: {
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-sm)',
        } as React.CSSProperties,
        glass: {
            background: 'var(--glass-bg)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            boxShadow: 'var(--glass-shadow)',
        } as React.CSSProperties,
        elevated: {
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
        } as React.CSSProperties,
        gradient: {
            background: 'linear-gradient(135deg, var(--brand-from), var(--brand-to))',
            border: 'none',
            boxShadow: 'var(--shadow-brand)',
            color: 'white',
        } as React.CSSProperties,
    }[variant];

    return (
        <div
            className={`${hover ? 'card-hover' : ''} ${className}`}
            style={{
                padding: '1.5rem',
                borderRadius: 'var(--r-lg)',
                transition: 'all 0.25s ease',
                ...variantStyles,
                ...props.style,
            }}
            {...props}
        >
            {(title || action) && (
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: isOpen ? '1.25rem' : 0,
                }}>
                    {title && (
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.625rem',
                                color: 'var(--text-primary)',
                                fontSize: '0.9375rem',
                                fontWeight: 600,
                                fontFamily: 'var(--font-sans)',
                                padding: 0,
                                letterSpacing: '-0.01em',
                            }}
                        >
                            {/* Chevron icon */}
                            <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: '22px',
                                height: '22px',
                                borderRadius: '6px',
                                background: 'var(--border-subtle)',
                                transition: 'transform 0.2s ease, background 0.2s ease',
                                transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                color: 'var(--text-secondary)',
                            }}>
                                <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </span>
                            {title}
                        </button>
                    )}
                    {action && (
                        <div style={{ flexShrink: 0 }}>{action}</div>
                    )}
                </div>
            )}

            {isOpen && (
                <div className="animate-fade-in">
                    {children}
                </div>
            )}
        </div>
    );
}
