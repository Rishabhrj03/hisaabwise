import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/context/AuthContext';

interface PhoneUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function PhoneUpdateModal({ isOpen, onClose, onSuccess }: PhoneUpdateModalProps) {
    const { updateProfile } = useAuth();
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (phone.length !== 10) {
            setError('Please enter a valid 10-digit phone number.');
            return;
        }

        setLoading(true);
        try {
            const res = await updateProfile(phone);
            if (res.error) {
                setError(res.error);
            } else {
                onSuccess();
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Complete Your Profile"
            size="sm"
        >
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.9rem' }}>
                    To add friends and use splitting features, we need your 10-digit phone number.
                </p>

                <div>
                    <Input
                        placeholder="Your Phone (10 digits)"
                        value={phone}
                        onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            if (val.length <= 10) setPhone(val);
                        }}
                        type="tel"
                        style={{ width: '100%' }}
                    />
                    {error && (
                        <p style={{ color: 'hsl(var(--hue-danger) 70% 50%)', fontSize: '0.8rem', marginTop: '0.5rem' }}>
                            {error}
                        </p>
                    )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button variant="ghost" onClick={onClose} type="button" disabled={loading}>
                        Cancel
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading || phone.length !== 10}>
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
