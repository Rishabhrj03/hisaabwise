import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createPortal } from 'react-dom';

interface EditUpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (upiId: string) => Promise<void>;
    initialValue: string;
    friendName: string;
}

export const EditUpiModal: React.FC<EditUpiModalProps> = ({ isOpen, onClose, onSave, initialValue, friendName }) => {
    const [upiId, setUpiId] = useState(initialValue);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setUpiId(initialValue);
    }, [initialValue, isOpen]);

    if (!isOpen) return null;

    const handleSave = async () => {
        if (!upiId || !upiId.includes('@')) {
            alert('Please enter a valid UPI ID (e.g. name@bank)');
            return;
        }
        setLoading(true);
        try {
            await onSave(upiId);
            onClose();
        } catch (error) {
            console.error(error);
            alert('Failed to save UPI ID');
        } finally {
            setLoading(false);
        }
    };

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 40000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: 'hsl(var(--color-background))',
                padding: '1.5rem',
                borderRadius: 'var(--radius-md)',
                width: '100%',
                maxWidth: '400px',
                border: '1px solid hsl(var(--color-border))',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '1.1rem' }}>
                    Edit UPI ID for {friendName}
                </h3>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>
                        UPI ID
                    </label>
                    <Input
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="john@okhdfcbank"
                        autoFocus
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </div>
        </div>,
        document.body
    );
};
