"use client";

import React, { useState } from 'react';

interface TooltipProps {
    text: string;
    children: React.ReactNode;
    position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ text, children, position = 'top' }) => {
    const [isVisible, setIsVisible] = useState(false);

    const getPositionStyles = () => {
        switch (position) {
            case 'top':
                return { bottom: '100%', left: '50%', transform: 'translateX(-50%) marginBottom: 8px' };
            case 'bottom':
                return { top: '100%', left: '50%', transform: 'translateX(-50%) marginTop: 8px' };
            case 'left':
                return { right: '100%', top: '50%', transform: 'translateY(-50%) marginRight: 8px' };
            case 'right':
                return { left: '100%', top: '50%', transform: 'translateY(-50%) marginLeft: 8px' };
            default:
                return { bottom: '100%', left: '50%', transform: 'translateX(-50%)' };
        }
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
            onClick={() => setIsVisible(!isVisible)}
        >
            {children}
            {isVisible && (
                <div style={{
                    position: 'absolute',
                    zIndex: 1000,
                    padding: '0.5rem 0.75rem',
                    backgroundColor: 'hsl(var(--color-surface))',
                    color: 'hsl(var(--color-text-main))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    whiteSpace: 'nowrap',
                    boxShadow: 'var(--shadow-md)',
                    pointerEvents: 'none',
                    animation: 'fadeIn 0.2s ease-out',
                    ...getPositionStyles()
                }}>
                    {text}
                </div>
            )}
        </div>
    );
};
