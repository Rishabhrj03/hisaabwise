import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from '@/components/ui/Button';
import { createPortal } from 'react-dom';

interface PaymentQRModalProps {
    isOpen: boolean;
    onClose: () => void;
    upiUrl: string;
    amount: string;
    recipientName: string;
}

export const PaymentQRModal: React.FC<PaymentQRModalProps> = ({ isOpen, onClose, upiUrl, amount, recipientName }) => {
    const [qrDataUrl, setQrDataUrl] = useState<string>('');

    useEffect(() => {
        if (isOpen && upiUrl) {
            QRCode.toDataURL(upiUrl, { width: 300, margin: 2 })
                .then(url => setQrDataUrl(url))
                .catch(err => console.error(err));
        }
    }, [isOpen, upiUrl]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 40000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '16px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                position: 'relative',
                boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <h3 style={{ margin: 0, color: '#333', fontSize: '1.25rem' }}>Pay ${amount} to {recipientName}</h3>
                    <p style={{ margin: '0.5rem 0 0', color: '#666', fontSize: '0.9rem' }}>Scan with any UPI app</p>
                </div>

                {qrDataUrl ? (
                    <img src={qrDataUrl} alt="Payment QR Code" style={{ width: '100%', maxWidth: '250px', borderRadius: '8px' }} />
                ) : (
                    <div style={{ width: '250px', height: '250px', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading QR...</div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%' }}>
                    <a href={upiUrl.replace('upi://', 'tez://upi/')} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                            GPay
                        </Button>
                    </a>
                    <a href={upiUrl.replace('upi://', 'phonepe://')} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                            PhonePe
                        </Button>
                    </a>
                    <a href={upiUrl.replace('upi://', 'paytmmp://')} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                            Paytm
                        </Button>
                    </a>
                    <a href={upiUrl} style={{ textDecoration: 'none' }}>
                        <Button variant="secondary" style={{ width: '100%', fontSize: '0.85rem' }}>
                            Other UPI
                        </Button>
                    </a>
                </div>

                <Button variant="secondary" onClick={onClose} style={{ width: '100%' }}>
                    Close
                </Button>
            </div>
        </div>,
        document.body
    );
};
