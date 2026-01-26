import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFriends } from '@/context/FriendContext';
import { Input } from '@/components/ui/Input';

export function FriendManager() {
    const { friends, addFriend, deleteFriend } = useFriends();
    const [newFriendName, setNewFriendName] = useState('');
    const [newFriendPhone, setNewFriendPhone] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFriendName.trim()) {
            await addFriend(newFriendName, newFriendPhone);
            setNewFriendName('');
            setNewFriendPhone('');
        }
    };

    const handleInvite = (friend: any) => {
        if (!friend.phone) return;

        // Clean phone number (remove spaces, etc)
        const cleanPhone = friend.phone.replace(/\D/g, '');
        const appUrl = window.location.origin;
        const text = encodeURIComponent(`Hey ${friend.name}, join me on Expense Tracker to split bills! ${appUrl}`);
        const waLink = `https://wa.me/${cleanPhone}?text=${text}`;

        window.open(waLink, '_blank');
    };

    return (
        <Card variant="default">
            <h3 style={{ marginBottom: '1rem' }}>Manage Friends</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Input
                        placeholder="Friend's Name"
                        value={newFriendName}
                        onChange={(e) => setNewFriendName(e.target.value)}
                        style={{ flex: 2 }}
                    />
                    <Input
                        placeholder="Phone (incl. country code)"
                        value={newFriendPhone}
                        onChange={(e) => setNewFriendPhone(e.target.value)}
                        type="tel"
                        style={{ flex: 1.5 }}
                    />
                    <Button type="submit" size="sm">Add</Button>
                </div>
                <p style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                    * Add phone number (e.g. 919876543210) to enable WhatsApp invites.
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
                                    onClick={() => deleteFriend(friend.id)}
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
        </Card>
    );
}
