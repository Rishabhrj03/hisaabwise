import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGroups } from '@/context/GroupContext';
import { useFriends } from '@/context/FriendContext';

export function GroupManager() {
    const { groups, addGroup, deleteGroup } = useGroups();
    const { friends } = useFriends();

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            try {
                await addGroup({
                    name: groupName,
                    memberIds: Array.from(selectedFriendIds)
                });
                setGroupName('');
                setSelectedFriendIds(new Set());
                setIsCreating(false);
            } catch (err) {
                console.error("Failed to create group", err);
                alert("Failed to create group");
            }
        }
    };

    const toggleFriend = (id: string) => {
        const newSet = new Set(selectedFriendIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedFriendIds(newSet);
    };

    return (
        <Card variant="default">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Groups</h3>
                <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
                    {isCreating ? 'Cancel' : 'Create Group'}
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'hsl(var(--color-background))', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Group Name</label>
                        <Input
                            placeholder="e.g. Goa Trip"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                        />
                    </div>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Add Members</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    onClick={() => toggleFriend(friend.id)}
                                    style={{
                                        padding: '0.5rem',
                                        border: `1px solid ${selectedFriendIds.has(friend.id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
                                        borderRadius: 'var(--radius-sm)',
                                        cursor: 'pointer',
                                        background: selectedFriendIds.has(friend.id) ? 'hsl(var(--color-primary) / 0.1)' : 'transparent',
                                        fontSize: '0.875rem'
                                    }}
                                >
                                    {friend.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <Button type="submit" style={{ width: '100%' }}>Create Group</Button>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {groups.length === 0 ? (
                    <p style={{ color: 'hsl(var(--color-text-muted))', fontSize: '0.875rem' }}>
                        No groups created yet.
                    </p>
                ) : (
                    groups.map(group => (
                        <div key={group.id} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: 'hsl(var(--color-background))',
                            borderRadius: 'var(--radius-sm)'
                        }}>
                            <div>
                                <span style={{ fontWeight: 500, display: 'block' }}>{group.name}</span>
                                <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))' }}>
                                    {group.members.length} members
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteGroup(group.id)}
                                style={{ color: 'hsl(var(--color-expense))', padding: '0.25rem' }}
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
