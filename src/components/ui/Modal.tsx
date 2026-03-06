import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    zIndex?: number;
}

export function Modal({ isOpen, onClose, title, children, size = 'md', zIndex = 30000 }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);
    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen || !mounted) return null;

    const getMaxWidth = () => {
        switch (size) {
            case 'sm': return '400px';
            case 'lg': return '800px';
            case 'xl': return '1000px';
            case '2xl': return '1200px';
            case 'md':
            default: return '500px';
        }
    };

    return createPortal(
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.75)', // Slightly darker for better contrast
                zIndex: zIndex,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '1rem',
                backdropFilter: 'blur(4px)', // Soften background
                animation: 'fadeIn 0.2s ease-out'
            }}
            onClick={onClose}
        >
            <div
                className="hide-scrollbar"
                style={{
                    background: 'hsl(var(--color-surface))',
                    border: '1px solid hsl(var(--color-border))',
                    borderRadius: 'var(--radius-lg)',
                    width: '100%',
                    maxWidth: getMaxWidth(),
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.3)', // Stronger shadow
                    animation: 'slideUp 0.3s ease-out',
                    transition: 'max-width 0.3s ease',
                    position: 'relative' // Ensure proper stacking
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid hsl(var(--color-border))',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>{title}</h3>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '1.5rem',
                            cursor: 'pointer',
                            color: 'hsl(var(--color-text-muted))',
                            padding: '0 0.5rem'
                        }}
                    >
                        ×
                    </button>
                </div>

                <div style={{
                    padding: '1.5rem',
                    overflowY: 'auto',
                    flex: 1
                }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
