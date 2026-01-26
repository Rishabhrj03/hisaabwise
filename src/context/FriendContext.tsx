"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Friend } from '@/types';

interface FriendContextType {
    friends: Friend[];
    addFriend: (name: string) => string;
    deleteFriend: (id: string) => void;
}

const FriendContext = createContext<FriendContextType | undefined>(undefined);

export function FriendProvider({ children }: { children: React.ReactNode }) {
    const [friends, setFriends] = useState<Friend[]>([]);

    // Load from LocalStorage
    useEffect(() => {
        const saved = localStorage.getItem('friends');
        if (saved) {
            try {
                setFriends(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse friends", e);
            }
        }
    }, []);

    // Save to LocalStorage
    useEffect(() => {
        localStorage.setItem('friends', JSON.stringify(friends));
    }, [friends]);

    const addFriend = (name: string) => {
        const id = crypto.randomUUID();
        const newFriend: Friend = {
            id,
            name: name.trim(),
        };
        setFriends((prev) => [...prev, newFriend]);
        return id;
    };

    const deleteFriend = (id: string) => {
        setFriends((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <FriendContext.Provider value={{ friends, addFriend, deleteFriend }}>
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
