import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from "html5-qrcode";
import { Button } from '@/components/ui/Button';
import { createPortal } from 'react-dom';

interface QRScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        if (!isOpen) return;

        // Small delay to ensure DOM is ready
        const timeoutId = setTimeout(() => {
            const scannerId = "reader";

            // Clean up previous instance if exists
            if (scannerRef.current) {
                scannerRef.current.clear().catch(console.error);
            }

            const html5QrCode = new Html5Qrcode(scannerId);
            scannerRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 250, height: 250 } };

            html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => {
                    // Success callback
                    onScanSuccess(decodedText);
                    html5QrCode.stop().then(() => {
                        scannerRef.current = null;
                        onClose();
                    }).catch(err => console.error("Failed to stop scanner", err));
                },
                (errorMessage) => {
                    // Error callback (called frequently, ignore parsing errors)
                    // console.log(errorMessage); 
                }
            ).catch(err => {
                console.error("Error starting scanner", err);
                setError("Camera access needed or not supported.");
            });

        }, 100);

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                scannerRef.current.stop().catch(console.error);
            }
        };
    }, [isOpen, onClose, onScanSuccess]);

    if (!isOpen) return null;

    return createPortal(
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)',
            zIndex: 10000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
        }}>
            <div style={{
                background: 'white',
                padding: '1rem',
                borderRadius: '12px',
                width: '100%',
                maxWidth: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem',
                position: 'relative'
            }}>
                <h3 style={{ textAlign: 'center', margin: 0, color: '#333' }}>Scan UPI QR Code</h3>

                {error ? (
                    <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
                ) : (
                    <div id="reader" style={{ width: '100%', minHeight: '300px' }}></div>
                )}

                <Button variant="secondary" onClick={() => {
                    if (scannerRef.current) {
                        try {
                            scannerRef.current.stop().then(() => {
                                scannerRef.current = null;
                                onClose();
                            });
                        } catch (e) { onClose(); }
                    } else {
                        onClose();
                    }
                }}>
                    Cancel
                </Button>
            </div>
        </div>,
        document.body
    );
};
