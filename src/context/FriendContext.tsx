"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Friend } from '@/types';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

interface FriendContextType {
    friends: Friend[];
    addFriend: (name: string, phone?: string) => Promise<string>;
    deleteFriend: (id: string) => Promise<void>;
    loading: boolean;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    // Load from Supabase
    useEffect(() => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        const fetchFriends = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('friends')
                .select('*')
                .eq('user_id', user.id);

            if (error) {
                console.error("Error fetching friends:", error);
            } else {
                setFriends(data || []);
            }
            setLoading(false);
        };

        fetchFriends();
    }, [user]);

    const addFriend = async (name: string, phone?: string) => {
        if (!user) throw new Error("User must be logged in to add friends");

        const id = crypto.randomUUID();
        const newFriend = {
            id,
            user_id: user.id,
            name: name.trim(),
            phone: phone ? phone.trim() : null,
            created_at: new Date().toISOString()
        };

        // Optimistic Update
        const optimisticFriend: Friend = {
            id: newFriend.id,
            name: newFriend.name,
            phone: newFriend.phone // We need to update Friend type too!
        };
        setFriends((prev) => [...prev, optimisticFriend]);

        const { error } = await supabase.from('friends').insert(newFriend);

        if (error) {
            console.error("Error adding friend:", error);
            // Revert on error
            setFriends((prev) => prev.filter((f) => f.id !== id));
            throw error;
        }

        return id;
    };

    const deleteFriend = async (id: string) => {
        if (!user) return;

        // Optimistic Update
        const previousFriends = [...friends];
        setFriends((prev) => prev.filter((f) => f.id !== id));

        const { error } = await supabase.from('friends').delete().eq('id', id);

        if (error) {
            console.error("Error deleting friend:", error);
            // Revert
            setFriends(previousFriends);
            throw error;
        }
    };

    return (
        <FriendContext.Provider value={{ friends, addFriend, deleteFriend, loading }}>
            {children}
        </FriendContext.Provider>
    );
}

export function useFriends() {
    const context = useContext(FriendContext);
    if (context === undefined) {
        throw new Error('useFriends must be used within a FriendProvider');
    }
    return context;
}
