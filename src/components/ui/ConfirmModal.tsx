import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'primary' | 'danger';
}

export function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title = "Confirm Action",
    message,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = 'danger'
}: ConfirmModalProps) {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            size="sm"
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))', lineHeight: '1.5' }}>
                    {message}
                </p>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Button variant="ghost" onClick={onClose}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant === 'danger' ? 'primary' : 'primary'}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                        style={variant === 'danger' ? { backgroundColor: 'hsl(var(--color-danger))', borderColor: 'hsl(var(--color-danger))' } : {}}
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
