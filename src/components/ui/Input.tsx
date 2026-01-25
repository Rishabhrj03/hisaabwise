import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

export function Input({ label, style, className, ...props }: InputProps) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%' }}>
            {label && (
                <label style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'hsl(var(--color-text-muted))'
                }}>
                    {label}
                </label>
            )}
            <input
                style={{
                    width: '100%',
                    padding: '0.875rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid hsl(var(--color-border))',
                    background: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text-main))',
                    fontSize: '1rem',
                    outline: 'none',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                    ...style
                }}
                onFocus={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--color-primary))';
                    e.currentTarget.style.boxShadow = '0 0 0 2px var(--color-primary-glow)';
                }}
                onBlur={(e) => {
                    e.currentTarget.style.borderColor = 'hsl(var(--color-border))';
                    e.currentTarget.style.boxShadow = 'none';
                }}
                {...props}
            />
        </div>
    );
}
