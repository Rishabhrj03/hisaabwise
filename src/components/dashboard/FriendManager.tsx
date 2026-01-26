import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useFriends } from '@/context/FriendContext';
import { Input } from '@/components/ui/Input';

export function FriendManager() {
    const { friends, addFriend, deleteFriend } = useFriends();
    const [newFriendName, setNewFriendName] = useState('');

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newFriendName.trim()) {
            await addFriend(newFriendName);
            setNewFriendName('');
        }
    };

    return (
        <Card variant="default">
            <h3 style={{ marginBottom: '1rem' }}>Manage Friends</h3>

            <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Input
                    placeholder="Friend's Name"
                    value={newFriendName}
                    onChange={(e) => setNewFriendName(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button type="submit" size="sm">Add</Button>
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
                            <span style={{ fontWeight: 500 }}>{friend.name}</span>
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
                    ))
                )}
            </div>
        </Card>
    );
}
