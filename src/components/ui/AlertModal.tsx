import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface AlertModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message: string;
}

export function AlertModal({ isOpen, onClose, title = "Alert", message }: AlertModalProps) {
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

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="primary" onClick={onClose} style={{ width: '100px' }}>
                        OK
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
