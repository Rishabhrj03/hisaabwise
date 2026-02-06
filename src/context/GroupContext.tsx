"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Group, GroupInput } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface GroupContextType {
    groups: Group[];
    addGroup: (input: GroupInput) => Promise<string>;
    updateGroup: (id: string, updates: Partial<GroupInput>) => Promise<void>;
    deleteGroup: (id: string) => Promise<void>;
    loading: boolean;
}

import useSWR from 'swr';

const GroupContext = createContext<GroupContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const mapToGroup = (doc: { _id: string; name: string; created_by: string; created_at: string; members?: any[] }): Group => ({
        id: doc._id,
        name: doc.name,
        created_by: doc.created_by,
        created_at: doc.created_at,
        members: (doc.members || []).map(m => {
            // Handle if members are just strings (e.g. during optimistic updates or if api fails to populate)
            if (typeof m === 'string') return { _id: m, name: 'Unknown Member' };
            return { _id: m._id, name: m.name, email: m.email };
        })
    });

    const { data: rawGroups, mutate, isLoading } = useSWR(
        user ? '/api/groups' : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    const groups = React.useMemo(() => {
        if (!rawGroups) return [];
        return Array.isArray(rawGroups) ? rawGroups.map(mapToGroup) : [];
    }, [rawGroups]);

    const addGroup = async (input: GroupInput) => {
        if (!user) throw new Error("User must be logged in");

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (res.ok) {
                mutate(); // Trigger revalidation
                const newDoc = await res.json();
                return newDoc._id; // Use _id from newDoc
            } else {
                throw new Error("Failed to add group");
            }
        } catch (error) {
            console.error("Error adding group:", error);
            throw error;
        }
    };

    const updateGroup = async (id: string, updates: Partial<GroupInput>) => {
        if (!user) return;

        try {
            const res = await fetch(`/api/groups/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });

            if (res.ok) {
                mutate();
            } else {
                console.error("Failed to update group");
            }
        } catch (error) {
            console.error("Error updating group:", error);
            throw error;
        }
    };

    const deleteGroup = async (id: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/groups/${id}`, { method: 'DELETE' });
            if (res.ok) mutate();
        } catch (error) {
            console.error("Error deleting group:", error);
            throw error;
        }
    };

    return (
        <GroupContext.Provider value={{ groups, addGroup, updateGroup, deleteGroup, loading: isLoading }}>
            {children}
        </GroupContext.Provider>
    );
}

export function useGroups() {
    const context = useContext(GroupContext);
    if (context === undefined) {
        throw new Error('useGroups must be used within a GroupProvider');
    }
    return context;
}
