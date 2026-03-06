"use client";

import React from 'react';
import useSWR from 'swr';
import { Card } from '@/components/ui/Card';
import { Activity } from '@/types';
import { User, Plus, Pencil, Trash2, Clock } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export function ActivityFeed() {
    const { data: activities, isLoading, error } = useSWR<Activity[]>('/api/activities', fetcher, {
        refreshInterval: 30000 // Refresh every 30 seconds
    });

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (error) {
        return <p style={{ color: 'hsl(var(--color-expense))', textAlign: 'center' }}>Failed to load activities.</p>;
    }

    if (!activities || activities.length === 0) {
        return (
            <Card variant="glass" style={{ textAlign: 'center', padding: '2rem' }}>
                <p style={{ color: 'hsl(var(--color-text-muted))' }}>No recent activity.</p>
            </Card>
        );
    }

    const getActionIcon = (action: string) => {
        switch (action) {
            case 'added': return <Plus size={14} color="hsl(var(--color-income))" />;
            case 'updated': return <Pencil size={14} color="hsl(var(--color-primary))" />;
            case 'deleted': return <Trash2 size={14} color="hsl(var(--color-expense))" />;
            default: return <Clock size={14} />;
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {activities.map((activity) => (
                <Card
                    key={activity._id}
                    variant="glass"
                    style={{
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        fontSize: '0.9rem'
                    }}
                >
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'hsl(var(--color-surface-muted))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        overflow: 'hidden'
                    }}>
                        {activity.user.image ? (
                            <img src={activity.user.image} alt={activity.user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <User size={18} />
                        )}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, lineHeight: 1.4 }}>
                            <span style={{ fontWeight: 600 }}>{activity.user.name}</span>
                            {' '}
                            <span style={{ color: 'hsl(var(--color-text-muted))' }}>{activity.action}</span>
                            {' '}
                            <span style={{ fontWeight: 500 }}>"{activity.targetName}"</span>
                            {activity.amount && (
                                <>
                                    {' '}
                                    <span style={{ color: 'hsl(var(--color-text-muted))' }}>worth</span>
                                    {' '}
                                    <span style={{ fontWeight: 600 }}>{new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(activity.amount)}</span>
                                </>
                            )}
                        </p>
                        <span style={{ fontSize: '0.75rem', color: 'hsl(var(--color-text-muted))', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            {getActionIcon(activity.action)}
                            {formatTime(activity.created_at)}
                            {activity.group && (
                                <>
                                    {' • '}
                                    <span style={{ color: 'hsl(var(--color-primary))' }}>{activity.group.name}</span>
                                </>
                            )}
                        </span>
                    </div>
                </Card>
            ))}
        </div>
    );
}
