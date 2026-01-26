"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Group, GroupInput } from '@/types';
import { supabase } from '@/lib/supabaseClient';
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

    const fetchGroups = async () => {
        if (!user) {
            setGroups([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        // Fetch groups and their members
        // group_members links to friends. We want the friend IDs.
        const { data, error } = await supabase
            .from('groups')
            .select(`
                *,
                group_members (
                    member_id
                )
            `)
            .eq('created_by', user.id)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching groups:", error);
        } else {
            const formattedGroups: Group[] = (data || []).map((g: any) => ({
                id: g.id,
                name: g.name,
                created_by: g.created_by,
                created_at: g.created_at,
                // Extract member IDs from joined table
                members: g.group_members.map((m: any) => m.member_id)
            }));
            setGroups(formattedGroups);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchGroups();
    }, [user]);

    const addGroup = async (input: GroupInput) => {
        if (!user) throw new Error("User must be logged in");

        const groupId = crypto.randomUUID();

        // 1. Insert Group
        const { error: groupError } = await supabase.from('groups').insert({
            id: groupId,
            created_by: user.id,
            name: input.name,
            created_at: new Date().toISOString()
        });

        if (groupError) throw groupError;

        // 2. Insert Members
        if (input.memberIds.length > 0) {
            const membersPayload = input.memberIds.map(mId => ({
                group_id: groupId,
                member_id: mId
            }));

            const { error: memberError } = await supabase
                .from('group_members')
                .insert(membersPayload);

            if (memberError) {
                console.error("Error adding group members:", memberError);
                // Rollback?
                await supabase.from('groups').delete().eq('id', groupId);
                throw memberError;
            }
        }

        // Refresh list
        await fetchGroups();
        return groupId;
    };

    const deleteGroup = async (id: string) => {
        if (!user) return;

        const { error } = await supabase.from('groups').delete().eq('id', id);

        if (error) {
            console.error("Error deleting group:", error);
            throw error;
        }

        setGroups(prev => prev.filter(g => g.id !== id));
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
