import React from 'react';

interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'glass';
    title?: React.ReactNode;
    action?: React.ReactNode;
    defaultOpen?: boolean;
}


export function Card({ children, className = '', variant = 'glass', title, action, defaultOpen = true, ...props }: CardProps) {
    const [isOpen, setIsOpen] = React.useState(defaultOpen);
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
            {(title || action) && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: isOpen ? '1rem' : 0 }}>
                    {title && (
                        <h3
                            onClick={() => setIsOpen(!isOpen)}
                            style={{ fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}
                        >
                            <span>{isOpen ? '▼' : '▶'}</span>
                            {title}
                        </h3>
                    )}
                    {action && <div>{action}</div>}
                </div>
            )}
            {isOpen && children}
        </div>
    );
}

