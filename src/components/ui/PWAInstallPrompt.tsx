'use client';
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Share } from 'lucide-react'; // Assuming we have lucide or similar, if not I'll use text/emoji

export function PWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showInstallModal, setShowInstallModal] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'other'>('other');

    useEffect(() => {
        // 1. Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        if (isStandalone) return;

        // 2. Platform Detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        if (/iphone|ipad|ipod/.test(userAgent)) {
            setPlatform('ios');
            // Check if already dismissed in this session
            if (!sessionStorage.getItem('pwa_dismissed')) {
                setShowInstallModal(true);
            }
        } else if (/android/.test(userAgent)) {
            setPlatform('android');
            // Android uses beforeinstallprompt
        }

        // 3. Android specific event listener
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            if (!sessionStorage.getItem('pwa_dismissed')) {
                setShowInstallModal(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setShowInstallModal(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setShowInstallModal(false);
        sessionStorage.setItem('pwa_dismissed', 'true');
    };

    if (!showInstallModal) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '90%',
            maxWidth: '400px',
            backgroundColor: 'hsl(var(--color-surface))',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            zIndex: 9999,
            border: '1px solid hsl(var(--color-border))',
            animation: 'slideUp 0.3s ease-out'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Install HisaabWise</h3>
                <button
                    onClick={handleDismiss}
                    style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'hsl(var(--color-text-muted))', lineHeight: 1 }}
                >
                    ×
                </button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'hsl(var(--color-text-muted))', marginBottom: '1.5rem' }}>
                {platform === 'ios'
                    ? "Install this app on your iPhone for the best experience. It works offline and loads faster!"
                    : "Install our app for easier access and offline capabilities."}
            </p>

            {platform === 'ios' ? (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
                        1. Tap the <strong>Share</strong> button <span style={{ fontSize: '1.2em' }}>⎋</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        2. Select <strong>Add to Home Screen</strong> <span style={{ fontSize: '1.2em' }}>⊞</span>
                    </div>
                </div>
            ) : (
                <Button onClick={handleInstallClick} style={{ width: '100%' }}>
                    Install App
                </Button>
            )}
        </div>
    );
}
