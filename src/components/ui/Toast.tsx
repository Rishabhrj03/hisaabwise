import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type = 'info', onClose, duration = 3000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);
        return () => clearTimeout(timer);
    }, [onClose, duration]);

    return createPortal(
        <div className="toast-container animate-in fade-in slide-in-from-bottom-5" style={{
            position: 'fixed',
            bottom: '2rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            backgroundColor: type === 'error' ? 'hsl(var(--hue-danger) 40% 40%)' :
                type === 'success' ? 'hsl(var(--hue-success) 40% 40%)' :
                    'hsl(var(--color-surface))',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: 'var(--radius-full)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            border: '1px solid rgba(255,255,255,0.1)',
            minWidth: '300px',
            justifyContent: 'center'
        }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{message}</span>
        </div>,
        document.body
    );
};
