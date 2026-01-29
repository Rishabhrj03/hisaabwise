"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Friend } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface FriendContextType {
    friends: Friend[];
    addFriend: (name: string, phone?: string, upi_id?: string) => Promise<string>;
    deleteFriend: (id: string) => Promise<void>;
    loading: boolean;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [friends, setFriends] = useState<Friend[]>([]);
    const [loading, setLoading] = useState(true);

    const mapToFriend = (doc: { _id: string; name: string; phone?: string; linked_user_id?: string; upi_id?: string }): Friend => ({
        id: doc._id,
        name: doc.name,
        phone: doc.phone,
        linked_user_id: doc.linked_user_id,
        upi_id: doc.upi_id
    });

    // Load from API
    useEffect(() => {
        if (!user) {
            setFriends([]);
            setLoading(false);
            return;
        }

        const fetchFriends = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/friends');
                if (res.ok) {
                    const data = await res.json();
                    setFriends(data.map(mapToFriend));
                } else {
                    console.error("Error fetching friends");
                }
            } catch (error) {
                console.error("Error fetching friends:", error);
            }
            setLoading(false);
        };

        fetchFriends();
    }, [user]);

    const addFriend = async (name: string, phone?: string, upi_id?: string) => {
        if (!user) throw new Error("User must be logged in to add friends");

        try {
            const res = await fetch('/api/friends', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, phone, upi_id }),
            });

            if (res.ok) {
                const newDoc = await res.json();
                const newFriend = mapToFriend(newDoc);
                setFriends((prev) => [...prev, newFriend]);
                return newFriend.id;
            } else {
                throw new Error("Failed to add friend");
            }
        } catch (error) {
            console.error("Error adding friend:", error);
            throw error;
        }
    };

    const deleteFriend = async (id: string) => {
        if (!user) return;

        // Optimistic Update
        const previousFriends = [...friends];
        setFriends((prev) => prev.filter((f) => f.id !== id));

        try {
            const res = await fetch(`/api/friends/${id}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                console.error("Error deleting friend");
                setFriends(previousFriends);
            }
        } catch (error) {
            console.error("Error deleting friend:", error);
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
