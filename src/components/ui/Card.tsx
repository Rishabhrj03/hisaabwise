import React, { useState } from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
    title?: React.ReactNode;
    action?: React.ReactNode;
    defaultOpen?: boolean;
}

export function Card({ children, className = '', variant = 'glass', title, action, defaultOpen = false, ...props }: CardProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const baseStyles = "p-6 rounded-2xl transition-all duration-300";
    const variants = {
        default: "bg-[hsl(var(--color-surface))] shadow-lg border border-[hsl(var(--color-border))]",
        glass: "glass-panel"
    };

    return (
        <div
            className={`${baseStyles} ${variants[variant]} ${className}`}
            style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                ...props.style
            }}
            {...props}
        >
            {title && (
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: isOpen ? '1rem' : '0',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: '#888', transform: isOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>▶</span>
                        <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>{title}</div>
                    </div>
                    {action && (
                        <div onClick={(e) => {
                            e.stopPropagation();
                            if (!isOpen) setIsOpen(true);
                        }}>
                            {action}
                        </div>
                    )}
                </div>
            )}

            {title ? (
                <div style={{ display: isOpen ? 'block' : 'none' }}>
                    {children}
                </div>
            ) : children}
        </div>
    );
}
