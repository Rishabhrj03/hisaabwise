"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Group, GroupInput } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface GroupContextType {
    groups: Group[];
    addGroup: (input: GroupInput) => Promise<string>;
    deleteGroup: (id: string) => Promise<void>;
    loading: boolean;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export function GroupProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [groups, setGroups] = useState<Group[]>([]);
    const [loading, setLoading] = useState(true);

    const mapToGroup = (doc: any): Group => ({
        id: doc._id,
        name: doc.name,
        created_by: doc.created_by,
        created_at: doc.created_at,
        members: doc.members || []
    });

    const fetchGroups = async () => {
        if (!user) {
            setGroups([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/groups');
            if (res.ok) {
                const data = await res.json();
                setGroups(data.map(mapToGroup));
            } else {
                console.error("Error fetching groups");
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, [user]);

    const addGroup = async (input: GroupInput) => {
        if (!user) throw new Error("User must be logged in");

        try {
            const res = await fetch('/api/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(input),
            });

            if (res.ok) {
                const newDoc = await res.json();
                const newGroup = mapToGroup(newDoc);
                setGroups(prev => [newGroup, ...prev]);
                return newGroup.id;
            } else {
                throw new Error("Failed to add group");
            }
        } catch (error) {
            console.error("Error adding group:", error);
            throw error;
        }
    };

    const deleteGroup = async (id: string) => {
        if (!user) return;

        try {
            const res = await fetch(`/api/groups/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                setGroups(prev => prev.filter(g => g.id !== id));
            } else {
                console.error("Error deleting group");
            }
        } catch (error) {
            console.error("Error deleting group:", error);
            throw error;
        }
    };

    return (
        <GroupContext.Provider value={{ groups, addGroup, deleteGroup, loading }}>
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
