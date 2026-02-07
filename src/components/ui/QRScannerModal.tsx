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
                try {
                    scannerRef.current.clear();
                } catch (e) {
                    console.error("Failed to clear scanner", e);
                }
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
                if (err?.name === 'NotAllowedError' || err?.message?.includes('Permission')) {
                    setError("Camera permission denied. Please enable camera access in your browser settings.");
                } else {
                    setError("Camera access needed. Please ensure your device has a camera and permissions are granted.");
                }
            });

        }, 300); // Increased delay slightly for stability

        return () => {
            clearTimeout(timeoutId);
            if (scannerRef.current) {
                // Determine if scanner is running is hard synchronously, so we just catch the specific error
                // The library throws if we try to stop a non-running scanner
                scannerRef.current.stop().then(() => {
                    // Stopped successfully
                }).catch(err => {
                    // Ignore "not running" errors as they are expected during cleanup of failed starts
                    // The error message from html5-qrcode is usually "Cannot stop, scanner is not running or paused"
                    const msg = err?.toString() || "";
                    if (!msg.includes('not running') && !msg.includes('not started')) {
                        console.warn("Gracefully handled scanner stop error:", msg);
                    }
                });
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
                        scannerRef.current.stop().then(() => {
                            // Scanner stopped
                            onClose();
                        }).catch((err) => {
                            // If stop fails (not running), just close
                            // console.log("Stop failed", err);
                            onClose();
                        });
                        scannerRef.current = null;
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
