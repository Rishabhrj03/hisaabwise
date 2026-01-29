import React, { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ShareDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ShareDashboardModal({ isOpen, onClose }: ShareDashboardModalProps) {
    const [isPublic, setIsPublic] = useState(false);
    const [shareToken, setShareToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [toggling, setToggling] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStatus();
        }
    }, [isOpen]);

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/user/share');
            const data = await res.json();
            setIsPublic(data.isPublic);
            setShareToken(data.shareToken);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (desiredState: boolean) => {
        setToggling(true);
        try {
            const res = await fetch('/api/user/share', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isPublic: desiredState })
            });
            const data = await res.json();
            if (data.success) {
                setIsPublic(data.isPublic);
                setShareToken(data.shareToken);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setToggling(false);
        }
    };

    const shareLink = typeof window !== 'undefined' && shareToken
        ? `${window.location.origin}/shared/${shareToken}`
        : '';

    const copyToClipboard = () => {
        navigator.clipboard.writeText(shareLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Dashboard">
            <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <div>
                            <p style={{ marginBottom: '0.5rem', color: 'hsl(var(--color-text-muted))' }}>
                                Allow anyone with the link to view your dashboard. They will not be able to edit or delete any data.
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'var(--color-surface)',
                                padding: '1rem',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--color-border)'
                            }}>
                                <span style={{ fontWeight: 600 }}>Public Access</span>
                                <Button
                                    variant={isPublic ? "danger" : "primary"}
                                    onClick={() => handleToggle(!isPublic)}
                                    disabled={toggling}
                                >
                                    {toggling ? 'Updating...' : (isPublic ? 'Disable' : 'Enable')}
                                </Button>
                            </div>
                        </div>

                        {isPublic && shareToken && (
                            <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>
                                    Public Link
                                </label>
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        readOnly
                                        value={shareLink}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: '1px solid var(--color-border)',
                                            background: 'var(--color-background)',
                                            color: 'var(--color-text-muted)'
                                        }}
                                    />
                                    <Button onClick={copyToClipboard} variant="secondary">
                                        {copied ? 'Copied!' : 'Copy'}
                                    </Button>
                                    <Button
                                        variant="secondary"
                                        onClick={() => window.open(shareLink, '_blank')}
                                        tooltip="Open in new tab"
                                    >
                                        Open ↗
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </Modal>
    );
}
