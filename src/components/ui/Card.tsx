import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
}

export function Card({ children, className = '', variant = 'glass', ...props }: CardProps) {
    const baseStyles = "p-6 rounded-2xl transition-all duration-300";
    const variants = {
        default: "bg-[hsl(var(--color-surface))] shadow-lg border border-[hsl(var(--color-border))]",
        glass: "glass-panel"
    };

    // Note: We are using a mix of utility classes that map to our global CSS variables.
    // Since we aren't using Tailwind, we'll inline some styles or use the global classes defined.
    // However, for simplicity in this demo, I will assume the globals.css classes like 'glass-panel' work.

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
            {children}
        </div>
    );
}
