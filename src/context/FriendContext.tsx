"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Friend } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface FriendContextType {
    friends: Friend[];
    addFriend: (name: string, phone?: string, upi_id?: string) => Promise<string>;
    updateFriend: (id: string, updates: Partial<{ name: string; phone: string; upi_id: string }>) => Promise<void>;
    deleteFriend: (id: string) => Promise<void>;
    loading: boolean;
}

import useSWR from 'swr';

const FriendContext = createContext<FriendContextType | undefined>(undefined);

const fetcher = (url: string) => fetch(url).then(r => r.json());

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();

    const mapToFriend = (doc: { _id: string; name: string; phone?: string; linked_user_id?: string; upi_id?: string }): Friend => ({
        id: doc._id,
        name: doc.name,
        phone: doc.phone,
        linked_user_id: doc.linked_user_id,
        upi_id: doc.upi_id
    });

    const { data: rawFriends, mutate, isLoading } = useSWR(
        user ? '/api/friends' : null,
        fetcher,
        { refreshInterval: 10000, revalidateOnFocus: true }
    );

    const friends = React.useMemo(() => {
        if (!rawFriends) return [];
        return Array.isArray(rawFriends) ? rawFriends.map(mapToFriend) : [];
    }, [rawFriends]);

    const addFriend = async (name: string, phone?: string, upi_id?: string) => {
        if (!user) throw new Error("User must be logged in to add friends");

        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, upi_id }),
            });

            if (res.ok) {
                mutate(); // Trigger revalidation
                const newDoc = await res.json();
                return newDoc._id; // Return ID based on API response structure
            } else {
                throw new Error("Failed to add friend");
            }
        } catch (error) {
            console.error("Error adding friend:", error);
            throw error;
        }
    };

    const updateFriend = async (id: string, updates: Partial<{ name: string; phone: string; upi_id: string }>) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/friends/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            });
            if (res.ok) mutate();
        } catch (error) {
            console.error("Error updating friend:", error);
            throw error;
        }
    };

    const deleteFriend = async (id: string) => {
        if (!user) return;
        try {
            const res = await fetch(`/api/friends/${id}`, { method: 'DELETE' });
            if (res.ok) mutate();
        } catch (error) {
            throw error;
        }
    };

    return (
        <FriendContext.Provider value={{ friends, addFriend, updateFriend, deleteFriend, loading: isLoading }}>
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
