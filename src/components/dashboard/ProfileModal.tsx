import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { User, Phone, CreditCard, Save, History } from 'lucide-react';
import { ActivityFeed } from './ActivityFeed';

interface ProfileModalProps {
    onClose: () => void;
}

export function ProfileModal({ onClose }: ProfileModalProps) {
    const { user, updateProfile } = useAuth();
    const [activeTab, setActiveTab] = useState<'profile' | 'activity'>('profile');
    const [name, setName] = useState(user?.name || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [upiId, setUpiId] = useState(user?.user_upi_id || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const result = await updateProfile({ name, phone, user_upi_id: upiId });
            if (result.error) {
                setError(result.error);
            } else {
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                }, 3000);
            }
        } catch (err) {
            setError('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                padding: '0.25rem',
                background: 'hsl(var(--color-surface-muted))',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '0.5rem'
            }}>
                <button
                    onClick={() => setActiveTab('profile')}
                    style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: activeTab === 'profile' ? 'hsl(var(--color-surface))' : 'transparent',
                        color: activeTab === 'profile' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
                        fontWeight: activeTab === 'profile' ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: activeTab === 'profile' ? 'var(--shadow-sm)' : 'none'
                    }}
                >
                    <User size={16} />
                    Edit Profile
                </button>
                <button
                    onClick={() => setActiveTab('activity')}
                    style={{
                        flex: 1,
                        padding: '0.6rem',
                        borderRadius: 'var(--radius-md)',
                        border: 'none',
                        background: activeTab === 'activity' ? 'hsl(var(--color-surface))' : 'transparent',
                        color: activeTab === 'activity' ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-muted))',
                        fontWeight: activeTab === 'activity' ? 600 : 500,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: activeTab === 'activity' ? 'var(--shadow-sm)' : 'none'
                    }}
                >
                    <History size={16} />
                    My Activity
                </button>
            </div>

            {activeTab === 'profile' ? (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                        <div style={{
                            width: '70px',
                            height: '70px',
                            borderRadius: '50%',
                            background: 'hsl(var(--color-surface))',
                            border: '2px solid hsl(var(--color-primary))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-glow)'
                        }}>
                            {user?.image ? (
                                <img src={user.image} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <User size={32} color="hsl(var(--color-primary))" />
                            )}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))' }}>Email (Non-editable)</label>
                        <div style={{
                            padding: '0.6rem 0.75rem',
                            borderRadius: 'var(--radius-md)',
                            background: 'hsl(var(--color-surface-muted))',
                            border: '1px solid var(--glass-border)',
                            color: 'hsl(var(--color-text-muted))',
                            fontSize: '0.85rem'
                        }}>
                            {user?.email}
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label htmlFor="p-name" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Full Name</label>
                        <div style={{ position: 'relative' }}>
                            <User size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-muted))' }} />
                            <input
                                id="p-name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your Name"
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'hsl(var(--color-text-main))',
                                    outline: 'none',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label htmlFor="p-phone" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Phone Number</label>
                        <div style={{ position: 'relative' }}>
                            <Phone size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-muted))' }} />
                            <input
                                id="p-phone"
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="10-digit number"
                                maxLength={10}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'hsl(var(--color-text-main))',
                                    outline: 'none',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label htmlFor="p-upi" style={{ fontSize: '0.8rem', fontWeight: 500 }}>UPI ID (for payments)</label>
                        <div style={{ position: 'relative' }}>
                            <CreditCard size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'hsl(var(--color-text-muted))' }} />
                            <input
                                id="p-upi"
                                type="text"
                                value={upiId}
                                onChange={(e) => setUpiId(e.target.value)}
                                placeholder="yourname@upi"
                                style={{
                                    width: '100%',
                                    padding: '0.6rem 0.85rem 0.6rem 2.4rem',
                                    borderRadius: 'var(--radius-md)',
                                    background: 'transparent',
                                    border: '1px solid var(--glass-border)',
                                    color: 'hsl(var(--color-text-main))',
                                    outline: 'none',
                                    fontSize: '0.85rem'
                                }}
                            />
                        </div>
                    </div>

                    {error && (
                        <div style={{ color: 'hsl(var(--color-expense))', fontSize: '0.8rem', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {success && (
                        <div style={{ color: 'hsl(var(--color-income))', fontSize: '0.8rem', textAlign: 'center' }}>
                            Profile updated successfully!
                        </div>
                    )}

                    <Button
                        type="submit"
                        variant="primary"
                        disabled={loading}
                        style={{ width: '100%', marginTop: '0.25rem', gap: '0.5rem' }}
                    >
                        <Save size={16} />
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </form>
            ) : (
                <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <ActivityFeed />
                </div>
            )}
        </div>
    );
}
