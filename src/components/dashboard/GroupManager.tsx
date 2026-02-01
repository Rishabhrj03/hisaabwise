import React, { useState } from 'react';
import { sendGTMEvent } from '@next/third-parties/google';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGroups } from '@/context/GroupContext';
import { useFriends } from '@/context/FriendContext';
import { Group } from '@/types';
import { AlertModal } from '@/components/ui/AlertModal';

export function GroupManager() {
    const { groups, addGroup, updateGroup, deleteGroup } = useGroups();
    const { friends } = useFriends();

    // Form State
    const [isCreating, setIsCreating] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [selectedFriendIds, setSelectedFriendIds] = useState<Set<string>>(new Set());
    const [editingId, setEditingId] = useState<string | null>(null);
    const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '' });

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            try {
                if (editingId) {
                    await updateGroup(editingId, {
                        name: groupName,
                        memberIds: Array.from(selectedFriendIds)
                    });
                    setEditingId(null);
                } else {
                    await addGroup({
                        name: groupName,
                        memberIds: Array.from(selectedFriendIds)
                    });

                    sendGTMEvent({
                        event: 'group_created',
                        value: { member_count: selectedFriendIds.size }
                    });
                }

                setGroupName('');
                setSelectedFriendIds(new Set());
                setIsCreating(false);
            } catch (err) {
                console.error("Failed to save group", err);
                setAlertConfig({ isOpen: true, title: 'Error', message: "Failed to save group" });
            }
        }
    };

    const handleEdit = (group: Group) => {
        setGroupName(group.name);
        // Map members (which are friend IDs per types) into Set
        setSelectedFriendIds(new Set(group.members));
        setEditingId(group.id);
        setIsCreating(true);
    };

    const handleCancelEdit = () => {
        setGroupName('');
        setSelectedFriendIds(new Set());
        setEditingId(null);
        setIsCreating(false);
    };

    const handleCopyLink = async (groupId: string, groupName: string) => {
        const link = `${window.location.origin}/join/${groupId}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Join ${groupName} on HisaabWise`,
                    text: `Join the group "${groupName}" to track shared expenses!`,
                    url: link,
                });
            } catch (error) {
                console.log('Error sharing:', error);
            }
        } else {
            navigator.clipboard.writeText(link);
            setAlertConfig({ isOpen: true, title: 'Success', message: 'Group link copied to clipboard!' });
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
        <Card variant="default" className="overflow-hidden">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>Groups</h3>
                <Button
                    size="sm"
                    variant={isCreating ? "secondary" : "primary"}
                    onClick={() => {
                        setIsCreating(!isCreating);
                        if (isCreating) handleCancelEdit();
                    }}
                    style={{ borderRadius: '999px', paddingLeft: '1.25rem', paddingRight: '1.25rem' }}
                >
                    {isCreating ? 'Cancel' : 'Create Group +'}
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="animate-in fade-in slide-in-from-top-4 duration-300" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'hsl(var(--color-surface))', borderRadius: 'var(--radius-lg)', border: '1px solid hsl(var(--color-border))' }}>
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))' }}>Group Name</label>
                        <Input
                            placeholder="e.g. Goa Trip"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            required
                            style={{ background: 'hsl(var(--color-background))' }}
                        />
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.75rem', fontSize: '0.875rem', fontWeight: 500, color: 'hsl(var(--color-text-muted))' }}>Add Members</label>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '0.75rem' }}>
                            {friends.map(friend => (
                                <div
                                    key={friend.id}
                                    onClick={() => toggleFriend(friend.id)}
                                    style={{
                                        padding: '0.6rem 0.75rem',
                                        border: `1px solid ${selectedFriendIds.has(friend.id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-border))'}`,
                                        borderRadius: 'var(--radius-md)',
                                        cursor: 'pointer',
                                        background: selectedFriendIds.has(friend.id) ? 'hsl(var(--color-primary) / 0.1)' : 'hsl(var(--color-background))',
                                        fontSize: '0.875rem',
                                        fontWeight: selectedFriendIds.has(friend.id) ? 500 : 400,
                                        color: selectedFriendIds.has(friend.id) ? 'hsl(var(--color-primary))' : 'hsl(var(--color-text-main))',
                                        transition: 'all 0.2s ease',
                                        textAlign: 'center'
                                    }}
                                >
                                    {friend.name}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <Button type="submit" style={{ flex: 1, padding: '0.75rem' }}>
                            {editingId ? 'Update Group' : 'Create Group'}
                        </Button>
                    </div>
                </form>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {groups.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '2rem', color: 'hsl(var(--color-text-muted))', background: 'hsl(var(--color-surface))', borderRadius: 'var(--radius-lg)', border: '1px dashed hsl(var(--color-border))' }}>
                        <p style={{ margin: 0, fontSize: '0.875rem' }}>No groups created yet.</p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.75rem', opacity: 0.7 }}>Create a group to split expenses easily.</p>
                    </div>
                ) : (
                    groups.map(group => (
                        <div key={group.id} className="group-item" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem',
                            background: 'hsl(var(--color-surface))',
                            borderRadius: 'var(--radius-lg)',
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: 'hsl(var(--color-primary) / 0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.25rem'
                                }}>
                                    👥
                                </div>
                                <div>
                                    <span style={{ fontWeight: 600, display: 'block', fontSize: '1rem' }}>{group.name}</span>
                                    <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                        {group.members.length} members
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleCopyLink(group.id, group.name)}
                                    title="Share Link"
                                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
                                >
                                    🔗
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEdit(group)}
                                    title="Edit"
                                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%' }}
                                >
                                    ✎
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteGroup(group.id)}
                                    title="Delete"
                                    style={{ width: '36px', height: '36px', padding: 0, borderRadius: '50%', color: 'hsl(var(--color-danger))' }}
                                >
                                    ✕
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>
            <AlertModal
                isOpen={alertConfig.isOpen}
                onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
                title={alertConfig.title}
                message={alertConfig.message}
            />
        </Card >
    );
}
