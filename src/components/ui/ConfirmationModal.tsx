import React from 'react';

interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    isLoading?: boolean;
}

export function ConfirmationModal({ isOpen, onClose, onConfirm, title, message, isLoading = false }: ConfirmationModalProps) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
        }}
            onClick={onClose}
        >
            <div
                className="glass-panel"
                style={{
                    width: '90%',
                    maxWidth: '400px',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    position: 'relative',
                    animation: 'fadeIn 0.2s ease-out'
                }}
                onClick={e => e.stopPropagation()}
            >
                <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', color: 'hsl(var(--color-text-main))' }}>
                    {title}
                </h3>
                <p style={{ marginBottom: '1.5rem', color: 'hsl(var(--color-text-muted))' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: '1px solid hsl(var(--color-border))',
                            background: 'transparent',
                            color: 'hsl(var(--color-text-main))',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.5 : 1
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={isLoading}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            border: 'none',
                            background: 'hsl(var(--color-expense))', // Using expense color (red) for delete actions
                            color: 'white',
                            cursor: 'pointer',
                            opacity: isLoading ? 0.7 : 1,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        {isLoading ? (
                            <>
                                <span style={{
                                    width: '12px',
                                    height: '12px',
                                    border: '2px solid white',
                                    borderTopColor: 'transparent',
                                    borderRadius: '50%',
                                    display: 'inline-block',
                                    animation: 'spin 1s linear infinite'
                                }}></span>
                                Deleting...
                            </>
                        ) : 'Delete'}
                    </button>
                </div>
            </div>
            <style jsx>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
