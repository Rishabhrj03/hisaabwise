import React, { useState } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFriends } from '@/context/FriendContext';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { PhoneUpdateModal } from './PhoneUpdateModal';
import { AlertModal } from '@/components/ui/AlertModal';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

import { Friend } from '@/types';

export function FriendManager() {
    const { friends, addFriend, updateFriend, deleteFriend } = useFriends();
    const [newFriendName, setNewFriendName] = useState('');
    const [newFriendPhone, setNewFriendPhone] = useState('');
    const [newFriendUpi, setNewFriendUpi] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    const [showPhoneModal, setShowPhoneModal] = useState(false);
    const [alertConfig, setAlertConfig] = useState<{ show: boolean, message: string }>({ show: false, message: '' });
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ id: string | null; name: string }>({ id: null, name: '' });
    const { user } = useAuth();

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1. Validate Current User's Phone
        const myPhone = user?.phone?.replace(/\D/g, '');
        if (!myPhone || myPhone.length !== 10) {
            setShowPhoneModal(true);
            return;
        }

        // 2. Validate Friend's Phone (Mandatory)
        if (!newFriendPhone || newFriendPhone.length !== 10) {
            setAlertConfig({
                show: true,
                message: "Please enter a valid 10-digit phone number. A phone number is required to add a friend."
            });
            return;
        }

        if (newFriendName.trim()) {
            if (editingId) {
                await updateFriend(editingId, {
                    name: newFriendName,
                    phone: newFriendPhone,
                    upi_id: newFriendUpi
                });
                sendGTMEvent({ event: 'friend_updated' });
                setEditingId(null);
            } else {
                await addFriend(newFriendName, newFriendPhone, newFriendUpi);
                sendGTMEvent({ event: 'friend_added' });
            }

            setNewFriendName('');
            setNewFriendPhone('');
            setNewFriendUpi('');
        }
    };

    const handleEdit = (friend: Friend) => {
        setNewFriendName(friend.name);
        setNewFriendPhone(friend.phone || '');
        setNewFriendUpi(friend.upi_id || '');
        setEditingId(friend.id);
    };

    const handleCancelEdit = () => {
        setNewFriendName('');
        setNewFriendPhone('');
        setNewFriendUpi('');
        setEditingId(null);
    };

    const handleInvite = (friend: Friend) => {
        if (!friend.phone) return;

        // Clean phone number (remove spaces, etc)
        let cleanPhone = friend.phone.replace(/\D/g, '');
        if (cleanPhone.length === 10) {
            cleanPhone = '91' + cleanPhone;
        }
        const appUrl = window.location.origin;
        const text = encodeURIComponent(`Hey ${friend.name}, join me on HisaabWise to split bills! ${appUrl}`);
        const waLink = `https://wa.me/${cleanPhone}?text=${text}`;

        // Use window.location.href instead of window.open
        // forcing a navigation is more reliable for triggering App Links/Deep Links
        // inside in-app browsers (like Instagram/Facebook) than opening a new popup.
        sendGTMEvent({ event: 'friend_invited' });
        window.location.href = waLink;
    };

    return (
        <Card variant="default">
            <h3 style={{ marginBottom: '1rem' }}>Manage Friends</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                {/* Row 1: Name */}
                <Input
                    placeholder="Friend's Name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    style={{ width: '100%' }}
                />

                {/* Row 2: Contact Details & Action */}
                {/* <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr auto', gap: '0.75rem' }}> */}
                <Input
                    placeholder="Phone (10 digits)"
                    value={newFriendPhone}
                    style={{ width: '100%' }}
                    onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 10) {
                            setNewFriendPhone(val);
                        }
                    }}
                    type="tel"
                />
                <Input
                    placeholder="UPI ID (optional)"
                    value={newFriendUpi}
                    onChange={(e) => setNewFriendUpi(e.target.value)}
                    style={{ width: '100%' }}
                />
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Button type="submit" size="sm" style={{ flex: 1 }}>
                        {editingId ? 'Update' : 'Add'}
                    </Button>
                    {editingId && (
                        <Button type="button" variant="ghost" size="sm" onClick={handleCancelEdit}>
                            Cancel
                        </Button>
                    )}
                </div>
                {/* </div> */}
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                    * Add 10-digit phone number to enable WhatsApp invites.
                </p>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {friends.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                        No friends added yet.
                    </p>
                ) : (
                    friends.map((friend) => (
                        <div key={friend.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.5rem',
                            background: 'hsl(var(--color-background))',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            <div>
                                <span style={{ fontWeight: 500, display: 'block' }}>{friend.name}</span>
                                {friend.phone && (
                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                                        {friend.phone}
                                    </span>
                                )}
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(friend)}
                                    style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                >
                                    Edit
                                </Button>
                                {friend.phone && !friend.linked_user_id && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleInvite(friend)}
                                        tooltip="Invite on WhatsApp"
                                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem' }}
                                    >
                                        Invite
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setDeleteConfirmation({ id: friend.id, name: friend.name })}
                                    style={{ color: 'hsl(var(--color-expense))', padding: '0.25rem' }}
                                    tooltip="Remove friend"
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>


            <PhoneUpdateModal
                isOpen={showPhoneModal}
                onClose={() => setShowPhoneModal(false)}
                onSuccess={() => setShowPhoneModal(false)}
            />

            <AlertModal
                isOpen={alertConfig.show}
                onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))}
                message={alertConfig.message}
                title="Invalid Phone Number"
            />
            <ConfirmModal
                isOpen={!!deleteConfirmation.id}
                onClose={() => setDeleteConfirmation({ id: null, name: '' })}
                onConfirm={() => {
                    if (deleteConfirmation.id) deleteFriend(deleteConfirmation.id);
                }}
                title="Delete Friend?"
                message={`Are you sure you want to remove "${deleteConfirmation.name}"? This will limit your ability to split expenses with them.`}
                confirmText="Remove"
                variant="danger"
            />
        </Card>
    );
}
