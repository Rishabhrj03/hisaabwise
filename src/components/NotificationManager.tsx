'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Loader2, Bell, X } from 'lucide-react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || 'BLWBlzbRgaUG0yfbALwbHRCUr9qRWgbpODV9mhXn2f6t9i_l-Lmmh3WfITpAGBo9OH3wR_3rSxJhnbz5ck6CD-Y';

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function NotificationManager() {
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && (window as any).workbox !== undefined) {
            navigator.serviceWorker.ready.then(reg => {
                setRegistration(reg);
                reg.pushManager.getSubscription().then(sub => {
                    if (sub) {
                        setIsSubscribed(true);
                    } else {
                        // Check if user has dismissed before
                        const hasDismissed = localStorage.getItem('notification-prompt-dismissed');
                        if (!hasDismissed) {
                            // Delay slightly for better UX
                            setTimeout(() => setShowPrompt(true), 2000);
                        }
                    }
                });
            });
        }
    }, []);

    const subscribeToPush = async () => {
        if (!registration) return;
        setLoading(true);
        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(sub)
            });

            setIsSubscribed(true);
            setShowPrompt(false);
            // alert('Notifications enabled!'); // Using UI feedback instead
        } catch (error) {
            console.error('Subscription failed', error);
            // If permission denied, checking permission state helps but for now just close
            if ((Notification as any).permission === 'denied') {
                localStorage.setItem('notification-prompt-dismissed', 'true');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleDismiss = () => {
        setShowPrompt(false);
        localStorage.setItem('notification-prompt-dismissed', 'true');
    };

    if (isSubscribed || !showPrompt) return null;

    if (typeof window !== 'undefined' && !('serviceWorker' in navigator)) return null;

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px', // Or center for mobile: left 24, right 24
            zIndex: 9999,
            animation: 'slideIn 0.3s ease-out',
        }} className="notification-prompt-container">
            <style jsx>{`
                @keyframes slideIn {
                    from { transform: translateY(100%); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @media (max-width: 640px) {
                    .notification-prompt-container {
                        left: 16px; 
                        right: 16px;
                        bottom: 16px;
                    }
                }
            `}</style>

            <div className="glass-panel" style={{
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 20px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(255,255,255,0.1)',
                background: 'rgba(23, 23, 23, 0.95)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                color: 'white',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
            }}>
                <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between', gap: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{
                            width: '40px',
                            height: '40px',
                            background: 'linear-gradient(135deg, hsl(var(--color-primary)) 0%, hsl(var(--hue-primary) 60% 60%) 100%)',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                        }}>
                            <Bell size={20} color="white" />
                        </div>
                        <div>
                            <h3 style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '0.25rem' }}>Enable Notifications</h3>
                            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.7)' }}>
                                Get updates whenever someone adds an expense.
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleDismiss}
                        style={{ flex: 1, color: 'rgba(255,255,255,0.6)' }}
                    >
                        Later
                    </Button>
                    <Button
                        size="sm"
                        onClick={subscribeToPush}
                        disabled={loading}
                        style={{ flex: 1 }}
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Turn On
                    </Button>
                </div>
            </div>
        </div>
    );
}
